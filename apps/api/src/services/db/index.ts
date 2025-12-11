import { Effect, Layer } from "effect"
import * as PgDrizzle from "@effect/sql-drizzle/Pg"
import { PgClient } from "@effect/sql-pg"
import { DatabaseConfig } from "./config"
import * as schema from "@dair/db"

export class Database extends Effect.Service<Database>()(
  "@dair/services/Database",
  {
    effect: PgDrizzle.make({
      schema,
    }),
  },
) {
  static layer = this.Default.pipe(
    Layer.provide(
      Layer.unwrapEffect(
        Effect.gen(function* () {
          const config = yield* DatabaseConfig
          return PgClient.layer({
            url: config.url,
          })
        }),
      ),
    ),
    Layer.provide(DatabaseConfig.layer),
  )
}
