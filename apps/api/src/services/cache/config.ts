import { Config, Context, Effect, Layer, Redacted } from "effect"

/**
 * Redis cache configuration
 */
export class CacheConfig extends Context.Tag("@app/CacheConfig")<
  CacheConfig,
  {
    readonly url: Redacted.Redacted
    readonly defaultTtlSeconds: number
  }
>() {
  static readonly layer = Layer.effect(
    CacheConfig,
    Effect.gen(function* () {
      const url = yield* Config.nonEmptyString("REDIS_URL").pipe(
        Config.withDefault("redis://localhost:6379"),
      )
      const defaultTtlSeconds = yield* Config.number(
        "CACHE_DEFAULT_TTL_SECONDS",
      ).pipe(Config.withDefault(300)) // 5 minutes default

      return CacheConfig.of({
        url: Redacted.make(url),
        defaultTtlSeconds,
      })
    }),
  )
}
