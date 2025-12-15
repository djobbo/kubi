import { BrawlhallaRateLimiter } from "@/services/rate-limiter"
import { Effect } from "effect"

/**
 * Get rate limiter token status
 */
export const getTokens = Effect.gen(function* () {
  const rateLimiter = yield* BrawlhallaRateLimiter
  return yield* rateLimiter.getStatus
})
