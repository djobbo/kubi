import "../env.js"

import { observabilityLayer } from "@dair/observability"
import { Effect, Layer } from "effect"

import { AliasesMigration } from "./services/aliases"
import { BookmarksMigration } from "./services/bookmarks"
import { MigrationConfig } from "./services/config"
import { MigrationDatabase } from "./services/db"
import { LegacyPostgres } from "./services/legacy-postgres"
import { LegacySupabase } from "./services/legacy-supabase"

const MAX_ALIASES_PER_ITERATION = 1000
const MAX_BOOKMARKS_PER_ITERATION = 1000

const program = Effect.gen(function* () {
  const aliasesMigration = yield* AliasesMigration
  const bookmarksMigration = yield* BookmarksMigration

  yield* Effect.log("Starting migration")

  yield* aliasesMigration.migrateAll(MAX_ALIASES_PER_ITERATION)
  yield* bookmarksMigration.migrateAll(MAX_BOOKMARKS_PER_ITERATION)

  yield* Effect.log("Migration complete")
})

const MainLayer = Layer.mergeAll(
  AliasesMigration.layer,
  BookmarksMigration.layer,
  LegacySupabase.layer,
  LegacyPostgres.layer,
  MigrationDatabase.layer,
  MigrationConfig.layer,
)

Effect.runPromise(
  program.pipe(
    Effect.provide(MainLayer),
    Effect.provide(observabilityLayer("migrator")),
    Effect.tapError(Effect.logError),
  ) as Effect.Effect<void, unknown, never>,
).catch((error) => {
  console.error(error)
  process.exit(1)
})
