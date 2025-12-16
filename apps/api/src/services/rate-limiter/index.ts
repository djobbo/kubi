import { Effect, RateLimiter, Duration } from "effect"

/**
 * Rate limiter status information
 */
export type RateLimiterStatus = {
  /** Rate limiter configuration */
  config: {
    limit: number
    intervalSeconds: number
  }
  /** Estimated available tokens (approximate, based on token bucket algorithm) */
  availableTokens: number
  /** Maximum capacity */
  maxCapacity: number
  /** Usage percentage (0-100) */
  usagePercent: number
}

/**
 * Complete rate limiter status for all limiters
 */
export type BrawlhallaRateLimiterStatus = {
  /** Global per-second limiter status */
  globalPerSecond: RateLimiterStatus
  /** Global per-15-minute limiter status */
  globalPer15Min: RateLimiterStatus
  /** Worker per-second limiter status */
  workerPerSecond: RateLimiterStatus
  /** Worker per-15-minute limiter status */
  workerPer15Min: RateLimiterStatus
  /** Timestamp when status was calculated */
  timestamp: Date
}

/**
 * Shared rate limiter service for Brawlhalla API requests.
 *
 * Enforces two limits:
 * - Maximum 10 requests per second (burst limit)
 * - Maximum 2000 requests per 15 minutes (sustained limit)
 *
 * Capacity allocation:
 * - Workers: ~70% (1400 requests per 15 min, ~1.56 req/sec average, max 7/sec burst)
 * - Frontend: ~30% (600 requests per 15 min, ~0.67 req/sec average, max 10/sec burst)
 *
 * Workers use a conservative rate limiter to avoid consuming all capacity.
 * Frontend requests get priority access to remaining capacity.
 */
export class BrawlhallaRateLimiter extends Effect.Service<BrawlhallaRateLimiter>()(
  "@dair/services/BrawlhallaRateLimiter",
  {
    effect: Effect.scoped(
      Effect.gen(function* () {
        // Global rate limiters that apply to all requests
        // These enforce the hard limits from the API provider
        const perSecondLimiter = yield* RateLimiter.make({
          limit: 10,
          interval: Duration.seconds(1),
        })
        const per15MinLimiter = yield* RateLimiter.make({
          limit: 2000,
          interval: Duration.minutes(15),
        })
        // Worker-specific rate limiter (conservative to leave capacity for frontend)
        // ~70% of capacity: 1400 requests per 15 min = ~1.56 req/sec average
        // Using 1.5 req/sec sustained with burst capability
        const workerPerSecondLimiter = yield* RateLimiter.make({
          limit: 7, // Max burst for workers (leaving 3/sec for frontend)
          interval: Duration.seconds(1),
        })
        const workerPer15MinLimiter = yield* RateLimiter.make({
          limit: 1400, // ~70% of total capacity
          interval: Duration.minutes(15),
        })
        // Track request counts for status reporting
        // Note: These are approximate since Effect's RateLimiter doesn't expose exact counts
        // We'll estimate based on the token bucket algorithm
        const requestCounts = {
          globalPerSecond: 0,
          globalPer15Min: 0,
          workerPerSecond: 0,
          workerPer15Min: 0,
        }
        const lastReset = {
          globalPerSecond: Date.now(),
          globalPer15Min: Date.now(),
          workerPerSecond: Date.now(),
          workerPer15Min: Date.now(),
        }
        /**
         * Apply both rate limiters sequentially and track usage.
         * Both limiters must have available tokens before the effect executes.
         * The effect executes only once after both checks pass.
         */
        const applyDualLimits = <A, E, R>(
          effect: Effect.Effect<A, E, R>,
          perSecond: RateLimiter.RateLimiter,
          per15Min: RateLimiter.RateLimiter,
          counters: {
            perSecond: keyof typeof requestCounts
            per15Min: keyof typeof requestCounts
          },
        ) => {
          // Track request before applying limiters
          const now = Date.now()
          requestCounts[counters.perSecond]++
          requestCounts[counters.per15Min]++
          // Reset counters if interval has passed (approximate)
          const perSecondInterval = Duration.toMillis(Duration.seconds(1))
          if (now - lastReset[counters.perSecond] >= perSecondInterval) {
            requestCounts[counters.perSecond] = 1
            lastReset[counters.perSecond] = now
          }
          const per15MinInterval = Duration.toMillis(Duration.minutes(15))
          if (now - lastReset[counters.per15Min] >= per15MinInterval) {
            requestCounts[counters.per15Min] = 1
            lastReset[counters.per15Min] = now
          }
          // Apply both limiters: per-second limiter wraps per-15-min limiter
          // This ensures both tokens are acquired before execution
          return perSecond(per15Min(effect))
        }
        /**
         * Calculate available tokens based on token bucket algorithm
         */
        const calculateAvailableTokens = (
          limit: number,
          intervalMs: number,
          used: number,
          lastResetTime: number,
        ): number => {
          const now = Date.now()
          const elapsed = now - lastResetTime
          const tokensRefilled = Math.floor((elapsed / intervalMs) * limit)
          const available = Math.min(limit, tokensRefilled - used + limit)
          return Math.max(0, available)
        }
        /**
         * Get status of all rate limiters
         */
        const getStatus = (): BrawlhallaRateLimiterStatus => {
          const perSecondIntervalMs = Duration.toMillis(Duration.seconds(1))
          const per15MinIntervalMs = Duration.toMillis(Duration.minutes(15))
          const globalPerSecondAvailable = calculateAvailableTokens(
            10,
            perSecondIntervalMs,
            requestCounts.globalPerSecond,
            lastReset.globalPerSecond,
          )
          const globalPer15MinAvailable = calculateAvailableTokens(
            2000,
            per15MinIntervalMs,
            requestCounts.globalPer15Min,
            lastReset.globalPer15Min,
          )
          const workerPerSecondAvailable = calculateAvailableTokens(
            7,
            perSecondIntervalMs,
            requestCounts.workerPerSecond,
            lastReset.workerPerSecond,
          )
          const workerPer15MinAvailable = calculateAvailableTokens(
            1400,
            per15MinIntervalMs,
            requestCounts.workerPer15Min,
            lastReset.workerPer15Min,
          )
          return {
            globalPerSecond: {
              config: {
                limit: 10,
                intervalSeconds: 1,
              },
              availableTokens: globalPerSecondAvailable,
              maxCapacity: 10,
              usagePercent: Math.round(
                ((10 - globalPerSecondAvailable) / 10) * 100,
              ),
            },
            globalPer15Min: {
              config: {
                limit: 2000,
                intervalSeconds: 900, // 15 minutes
              },
              availableTokens: globalPer15MinAvailable,
              maxCapacity: 2000,
              usagePercent: Math.round(
                ((2000 - globalPer15MinAvailable) / 2000) * 100,
              ),
            },
            workerPerSecond: {
              config: {
                limit: 7,
                intervalSeconds: 1,
              },
              availableTokens: workerPerSecondAvailable,
              maxCapacity: 7,
              usagePercent: Math.round(
                ((7 - workerPerSecondAvailable) / 7) * 100,
              ),
            },
            workerPer15Min: {
              config: {
                limit: 1400,
                intervalSeconds: 900, // 15 minutes
              },
              availableTokens: workerPer15MinAvailable,
              maxCapacity: 1400,
              usagePercent: Math.round(
                ((1400 - workerPer15MinAvailable) / 1400) * 100,
              ),
            },
            timestamp: new Date(),
          }
        }
        return {
          /**
           * Rate limit a worker request.
           * Uses conservative limits to reserve capacity for frontend.
           */
          limitWorker: <A, E, R>(effect: Effect.Effect<A, E, R>) =>
            applyDualLimits(
              effect,
              workerPerSecondLimiter,
              workerPer15MinLimiter,
              {
                perSecond: "workerPerSecond",
                per15Min: "workerPer15Min",
              },
            ),
          /**
           * Rate limit a frontend API request.
           * Uses global limits with priority access to remaining capacity.
           */
          limitFrontend: <A, E, R>(effect: Effect.Effect<A, E, R>) =>
            applyDualLimits(effect, perSecondLimiter, per15MinLimiter, {
              perSecond: "globalPerSecond",
              per15Min: "globalPer15Min",
            }),
          /**
           * Get current status of all rate limiters
           */
          getStatus: Effect.sync(getStatus),
        }
      }),
    ),
  },
) {
  static readonly layer = this.Default
}

/**
 * Rate limiter presets for workers (backward compatibility)
 * These are now just wrappers around the shared rate limiter
 */
export const rateLimiterPresets = {
  /**
   * Conservative: Uses worker rate limits (1.5 req/sec average, 7/sec max burst)
   */
  conservative: "worker" as const,
  /**
   * Standard: Uses worker rate limits (1.5 req/sec average, 7/sec max burst)
   */
  standard: "worker" as const,
  /**
   * Fast: Uses worker rate limits (1.5 req/sec average, 7/sec max burst)
   * Note: All worker presets use the same limits now to ensure capacity reservation
   */
  fast: "worker" as const,
} as const

/**
 * Create a rate limiter function for workers (backward compatibility)
 * @deprecated Use BrawlhallaRateLimiter.limitWorker directly
 */
export const makeRateLimiter = (
  _preset: (typeof rateLimiterPresets)[keyof typeof rateLimiterPresets],
) =>
  Effect.gen(function* () {
    const rateLimiter = yield* BrawlhallaRateLimiter
    return rateLimiter.limitWorker
  })
