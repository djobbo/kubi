import { Effect, Schedule, Duration } from "effect"

/**
 * Check if an error is an HTTP error with a specific status
 */
export const isHttpError = (error: unknown, status: number): boolean =>
  error !== null &&
  typeof error === "object" &&
  "_tag" in error &&
  error._tag === "HttpApiDecodeError" &&
  "response" in error &&
  typeof error.response === "object" &&
  error.response !== null &&
  "status" in error.response &&
  error.response.status === status

/**
 * Check if an error is a rate limit error (429)
 */
export const isRateLimitError = (error: unknown): boolean =>
  isHttpError(error, 429)

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
    Schedule.whileInput(isRateLimitError),
    Schedule.intersect(Schedule.recurs(maxRetries)),
  )
}

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
