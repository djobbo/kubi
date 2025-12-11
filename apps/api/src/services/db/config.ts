import { Config, Context, Effect, Layer, Redacted } from "effect"

/**
 * Database configuration
 */
export class DatabaseConfig extends Context.Tag("@app/DatabaseConfig")<
  DatabaseConfig,
  {
    readonly url: Redacted.Redacted
    readonly cacheVersion: number
  }
>() {
  static readonly layer = Layer.effect(
    DatabaseConfig,
    Effect.gen(function* () {
      const url = yield* Config.nonEmptyString("DATABASE_URL")
      const cacheVersion = yield* Config.number("DATABASE_CACHE_VERSION")

      return DatabaseConfig.of({ url: Redacted.make(url), cacheVersion })
    }),
  )
}
