import { Config, Context, Effect, Layer } from "effect"
import type { worker } from "~/alchemy.run.ts"

/**
 * Database configuration
 */
export class DatabaseConfig extends Context.Tag("@app/DatabaseConfig")<
  DatabaseConfig,
  {
    readonly database: (typeof worker.Env)["DATABASE"]
    readonly cacheVersion: number
  }
>() {
  static readonly layer = Layer.effect(
    DatabaseConfig,
    Effect.gen(function* () {
      const cacheVersion = yield* Config.number("DATABASE_CACHE_VERSION")
      const database = yield* Config.succeed<(typeof worker.Env)["DATABASE"]>(
        process.env.DATABASE,
      )

      return DatabaseConfig.of({ database, cacheVersion })
    }),
  )
}
