import { BrawlhallaRateLimiter } from "@/services/rate-limiter"
import { Effect } from "effect"
import { GetRateLimiterStatusResponse } from "@dair/api-contract/src/routes/v1/brawlhalla/get-rate-limiter-status"

/**
 * Get rate limiter token status
 */
export const getRateLimiterStatus = Effect.gen(function* () {
  const rateLimiter = yield* BrawlhallaRateLimiter
  const status = yield* rateLimiter.getStatus

  return GetRateLimiterStatusResponse.make({
    data: status,
    meta: {
      timestamp: new Date(),
    },
  })
})
