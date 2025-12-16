import { Effect, RateLimiter, Duration } from "effect"

/**
 * Rate limiter status information
 */
export type RateLimiterStatus = {
  /** Per-second limiter status */
  perSecond: {
    limit: number
    intervalSeconds: number
    availableTokens: number
    usagePercent: number
  }
  /** Per-15-minute limiter status */
  per15Min: {
    limit: number
    intervalSeconds: number
    availableTokens: number
    usagePercent: number
  }
  /** Timestamp when status was calculated */
  timestamp: Date
}

/**
 * Rate limiter service for Brawlhalla API requests.
 *
 * Enforces the hard limits from the Brawlhalla API:
 * - Maximum 10 requests per second (burst limit)
 * - Maximum 2000 requests per 15 minutes (sustained limit)
 *
 * Note: Workers have their own rate limiter in the workers app.
 * This rate limiter only controls direct calls to the external Brawlhalla API.
 */
export class BrawlhallaRateLimiter extends Effect.Service<BrawlhallaRateLimiter>()(
  "@dair/services/BrawlhallaRateLimiter",
  {
    effect: Effect.scoped(
      Effect.gen(function* () {
        // Rate limiters enforcing the hard limits from the API provider
        const perSecondLimiter = yield* RateLimiter.make({
          limit: 10,
          interval: Duration.seconds(1),
        })
        const per15MinLimiter = yield* RateLimiter.make({
          limit: 2000,
          interval: Duration.minutes(15),
        })

        // Track request counts for status reporting
        let perSecondCount = 0
        let per15MinCount = 0
        let lastPerSecondReset = Date.now()
        let lastPer15MinReset = Date.now()

        /**
         * Apply both rate limiters and track usage.
         */
        const applyRateLimit = <A, E, R>(effect: Effect.Effect<A, E, R>) => {
          const now = Date.now()

          // Update per-second counter
          if (now - lastPerSecondReset >= 1000) {
            perSecondCount = 0
            lastPerSecondReset = now
          }
          perSecondCount++

          // Update per-15-min counter
          if (now - lastPer15MinReset >= 900000) {
            per15MinCount = 0
            lastPer15MinReset = now
          }
          per15MinCount++

          // Apply both limiters: per-second wraps per-15-min
          return perSecondLimiter(per15MinLimiter(effect))
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
         * Get current status of rate limiters
         */
        const getStatus = (): RateLimiterStatus => {
          const perSecondAvailable = calculateAvailableTokens(
            10,
            1000,
            perSecondCount,
            lastPerSecondReset,
          )
          const per15MinAvailable = calculateAvailableTokens(
            2000,
            900000,
            per15MinCount,
            lastPer15MinReset,
          )

          return {
            perSecond: {
              limit: 10,
              intervalSeconds: 1,
              availableTokens: perSecondAvailable,
              usagePercent: Math.round(((10 - perSecondAvailable) / 10) * 100),
            },
            per15Min: {
              limit: 2000,
              intervalSeconds: 900,
              availableTokens: per15MinAvailable,
              usagePercent: Math.round(
                ((2000 - per15MinAvailable) / 2000) * 100,
              ),
            },
            timestamp: new Date(),
          }
        }

        return {
          /**
           * Rate limit an API request.
           * Enforces both per-second and per-15-minute limits.
           */
          limit: applyRateLimit,
          /**
           * Get current status of rate limiters
           */
          getStatus: Effect.sync(getStatus),
        }
      }),
    ),
  },
) {
  static readonly layer = this.Default
}
