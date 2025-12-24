import { Config, Context, Effect, Layer, Redacted } from "effect"

/**
 * Database configuration
 */
export class DatabaseConfig extends Context.Tag("@app/DatabaseConfig")<
  DatabaseConfig,
  {
    readonly url: Redacted.Redacted
  }
>() {
  static readonly layer = Layer.effect(
    DatabaseConfig,
    Effect.gen(function* () {
      const url = yield* Config.nonEmptyString("DATABASE_URL")

      return DatabaseConfig.of({ url: Redacted.make(url) })
    }),
  )
}
