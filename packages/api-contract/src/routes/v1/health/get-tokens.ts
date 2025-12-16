import { Schema } from "effect"

/**
 * Rate limiter status for a single limiter
 */
export const RateLimiterStatus = Schema.Struct({
  limit: Schema.Number,
  intervalSeconds: Schema.Number,
  availableTokens: Schema.Number,
  usagePercent: Schema.Number,
})

/**
 * Complete rate limiter status response
 */
export const GetTokensResponse = Schema.Struct({
  perSecond: RateLimiterStatus,
  per15Min: RateLimiterStatus,
  timestamp: Schema.Date,
})

export type GetTokensResponse = Schema.Schema.Type<typeof GetTokensResponse>
export type RateLimiterStatus = Schema.Schema.Type<typeof RateLimiterStatus>
