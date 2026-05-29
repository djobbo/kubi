import { Config, Context, Effect, Layer, Redacted } from "effect"

/**
 * Database configuration
 */
export class DatabaseConfig extends Context.Service<DatabaseConfig>()(
  "@app/DatabaseConfig",
  {
    make: Effect.gen(function* () {
      const url = yield* Config.nonEmptyString("DATABASE_URL")
      return { url: Redacted.make(url) }
    }),
  },
) {
  static readonly layer = Layer.effect(this, this.make)
}
