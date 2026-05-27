import { Context, Effect, Layer } from "effect"
import * as PgDrizzle from "drizzle-orm/effect-postgres"
import { PgClient } from "@effect/sql-pg"
import { relations } from "@dair/db"

import { MigrationConfig } from "../config"

export class MigrationDatabase extends Context.Service<MigrationDatabase>()(
  "@dair/migrator/MigrationDatabase",
  {
    make: PgDrizzle.make({ relations }).pipe(
      Effect.provide(PgDrizzle.DefaultServices),
    ),
  },
) {
  static readonly layer = Layer.effect(this, this.make).pipe(
    Layer.provide(
      Layer.unwrap(
        Effect.gen(function* () {
          const config = yield* MigrationConfig
          return PgClient.layer({ url: config.targetDatabaseUrl })
        }),
      ),
    ),
    Layer.provide(MigrationConfig.layer),
  )
}
