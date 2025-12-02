import { Config, Context, Effect, Layer } from "effect"

/**
 * Database configuration
 */
export class DatabaseConfig extends Context.Tag("@app/DatabaseConfig")<
  DatabaseConfig,
  {
    readonly url: string
    readonly cacheVersion: number
  }
>() {
  static readonly layer = Layer.effect(
    DatabaseConfig,
    Effect.gen(function* () {
      const url = yield* Config.nonEmptyString("DATABASE_URL")
      const cacheVersion = yield* Config.number("DATABASE_CACHE_VERSION")

      return DatabaseConfig.of({ url, cacheVersion })
    }),
  )

  /**
   * Test layer with in-memory database
   */
  static readonly testLayer = Layer.succeed(
    DatabaseConfig,
    DatabaseConfig.of({
      url: ":memory:",
      cacheVersion: 1,
    }),
  )
}
