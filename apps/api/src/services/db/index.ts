import { Context, Effect, Layer } from "effect"
import * as PgDrizzle from "drizzle-orm/effect-postgres"
import { PgClient } from "@effect/sql-pg"
import { DatabaseConfig } from "./config"
import { relations } from "@dair/db"

export class Database extends Context.Service<Database>()(
  "@dair/services/Database",
  {
    make: PgDrizzle.make({ relations }).pipe(
      // Layer init only — not tied to an HTTP request; avoid a stray root trace.
      Effect.withTracerEnabled(false),
      Effect.provide(PgDrizzle.DefaultServices),
    ),
  },
) {
  static readonly layer = Layer.effect(this, this.make).pipe(
    Layer.provide(
      Layer.unwrap(
        Effect.gen(function* () {
          const config = yield* DatabaseConfig
          return PgClient.layer({ url: config.url })
        }),
      ),
    ),
    Layer.provide(DatabaseConfig.layer),
  )
}
