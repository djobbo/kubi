import { Effect, RateLimiter, Duration } from "effect"

/**
 * Worker rate limiter service.
 * Controls how fast workers call the API to avoid overwhelming it.
 *
 * This is separate from the API's internal rate limiter (which limits
 * calls to the external Brawlhalla API). This limiter controls how
 * often the workers make requests to our own API.
 *
 * Configuration:
 * - 3 requests per second (burst limit)
 * - 100 requests per 15 minutes (sustained limit)
 */
export class WorkerRateLimiter extends Effect.Service<WorkerRateLimiter>()(
  "@dair/workers/WorkerRateLimiter",
  {
    effect: Effect.scoped(
      Effect.gen(function* () {
        // Per-second burst limiter
        const perSecondLimiter = yield* RateLimiter.make({
          limit: 1,
          interval: Duration.seconds(1),
          algorithm: "fixed-window",
        })

        // Per-15-minute sustained limiter
        const per15MinLimiter = yield* RateLimiter.make({
          limit: 100,
          interval: Duration.minutes(15),
          algorithm: "token-bucket",
        })

        return {
          /**
           * Apply rate limiting to an effect.
           * Both per-second and per-15-minute limits must be satisfied.
           */
          limit: <A, E, R>(effect: Effect.Effect<A, E, R>) =>
            perSecondLimiter(per15MinLimiter(effect)),
        }
      }),
    ),
  },
) {
  static readonly layer = this.Default
}
