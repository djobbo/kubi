import { Schema } from "effect"

export const RateLimiterStatus = Schema.Struct({
  remaining: Schema.Number,
  limit: Schema.Number,
  delay: Schema.Number,
  resetAfter: Schema.Number,
})

export const GetRateLimiterStatusResponse = Schema.Struct({
  data: RateLimiterStatus,
  meta: Schema.Struct({
    timestamp: Schema.Date,
  }),
})

export type GetRateLimiterStatusResponse = Schema.Schema.Type<
  typeof GetRateLimiterStatusResponse
>
export type RateLimiterStatus = Schema.Schema.Type<typeof RateLimiterStatus>
