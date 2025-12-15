import { Effect, Schedule, Duration, RateLimiter } from "effect"

/**
 * Check if an error is a BrawlhallaRateLimitError
 */
export const isBrawlhallaRateLimitError = (error: unknown): boolean =>
  error !== null &&
  typeof error === "object" &&
  "_tag" in error &&
  error._tag === "BrawlhallaRateLimitError"

/**
 * Create a retry schedule for rate-limited requests.
 * Uses exponential backoff with a maximum number of retries.
 */
export const rateLimitRetrySchedule = (options: {
  /** Base delay for exponential backoff (default: 5 seconds) */
  baseDelay?: Duration.Duration
  /** Maximum number of retries (default: 3) */
  maxRetries?: number
}) => {
  const { baseDelay = Duration.seconds(5), maxRetries = 3 } = options

  return Schedule.exponential(baseDelay).pipe(
    Schedule.whileInput(isBrawlhallaRateLimitError),
    Schedule.intersect(Schedule.recurs(maxRetries)),
  )
}

/**
 * Rate limiter configuration options
 */
export type RateLimiterOptions = {
  /** Maximum requests per interval */
  limit: number
  /** Time interval for the rate limit */
  interval: Duration.Duration
}

/**
 * Create a rate limiter with the given options
 */
export const makeRateLimiter = (options: RateLimiterOptions) =>
  RateLimiter.make({
    limit: options.limit,
    interval: options.interval,
  })

/**
 * Common rate limiter presets
 */
export const rateLimiterPresets = {
  /** Conservative: 1 request per 5 seconds */
  conservative: { limit: 1, interval: Duration.seconds(5) },
  /** Standard: 1 request per 2 seconds */
  standard: { limit: 1, interval: Duration.seconds(2) },
  /** Fast: 3 requests per second */
  fast: { limit: 3, interval: Duration.seconds(1) },
} as const satisfies Record<string, RateLimiterOptions>

/**
 * Wrap an effect with rate limit retry logic
 */
export const withRateLimitRetry = <A, E, R>(
  effect: Effect.Effect<A, E, R>,
  options: {
    baseDelay?: Duration.Duration
    maxRetries?: number
  } = {},
) => effect.pipe(Effect.retry(rateLimitRetrySchedule(options)))
