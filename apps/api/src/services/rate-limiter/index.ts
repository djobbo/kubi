import { Effect, Duration, Layer } from "effect"
import { RateLimiter } from "@effect/experimental"
import { RateLimiterStatus } from "@dair/api-contract/src/routes/v1/brawlhalla/get-rate-limiter-status"

export class BrawlhallaRateLimiter extends Effect.Service<BrawlhallaRateLimiter>()(
  "@dair/services/BrawlhallaRateLimiter",
  {
    effect: Effect.gen(function* () {
      const limiter = yield* RateLimiter.RateLimiter
      const withLimiter = yield* RateLimiter.makeWithRateLimiter

      const per15MinLimiterConfig: Parameters<typeof limiter.consume>[0] = {
        key: "brawlhalla-api-request-per-15-minutes",
        limit: 2000,
        tokens: 1,
        window: Duration.minutes(15),
        algorithm: "token-bucket",
        onExceeded: "delay",
      }

      const limitPerSecond = withLimiter({
        key: "brawlhalla-api-request-per-second",
        limit: 10,
        tokens: 1,
        window: Duration.seconds(1),
        algorithm: "token-bucket",
        onExceeded: "delay",
      })
      const limitPer15Min = withLimiter(per15MinLimiterConfig)
      const checkLimiter = limiter.consume({
        ...per15MinLimiterConfig,
        tokens: 0,
      })

      return {
        limit: <A, E, R>(effect: Effect.Effect<A, E, R>) =>
          limitPerSecond(limitPer15Min(effect)),
        getStatus: Effect.gen(function* () {
          const per15MinStatus = yield* checkLimiter.pipe(
            Effect.catchTag("RateLimiterError", () =>
              Effect.succeed({
                remaining: 0,
                limit: 0,
                delay: Duration.zero,
                resetAfter: Duration.zero,
              }),
            ),
          )

          return RateLimiterStatus.make({
            remaining: per15MinStatus.remaining,
            limit: per15MinStatus.limit,
            delay: Duration.toMillis(per15MinStatus.delay),
            resetAfter: Duration.toMillis(per15MinStatus.resetAfter),
          })
        }),
      }
    }),
  },
) {
  static readonly layer = this.Default.pipe(
    Layer.provide(RateLimiter.layer),
    Layer.provide(RateLimiter.layerStoreMemory),
  )
}
