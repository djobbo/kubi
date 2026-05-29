import { Config, Context, Effect, Layer, Option, Redacted } from "effect"

import { MigrationFetchError } from "../errors"

export class MigrationConfig extends Context.Service<MigrationConfig>()(
  "@dair/migrator/MigrationConfig",
  {
    make: Effect.gen(function* () {
      const supabaseUrl = yield* Config.nonEmptyString("MIGRATION_SUPABASE_URL")
      const supabaseServiceKey = yield* Config.redacted(
        "MIGRATION_SUPABASE_SERVICE_KEY",
      )

      const targetDatabaseUrl = yield* Config.nonEmptyString(
        "MIGRATION_DATABASE_URL",
      ).pipe(Config.orElse(() => Config.nonEmptyString("DATABASE_URL")))

      const legacyFromMigration = yield* Config.option(
        Config.nonEmptyString("MIGRATION_SUPABASE_DATABASE_URL"),
      )
      const legacyFromDefault = yield* Config.option(
        Config.nonEmptyString("DATABASE_URL"),
      )
      const legacyDatabaseUrl = Option.orElse(
        legacyFromMigration,
        () => legacyFromDefault,
      )

      if (Option.isNone(legacyDatabaseUrl)) {
        return yield* Effect.fail(
          new MigrationFetchError({
            message:
              "Missing MIGRATION_SUPABASE_DATABASE_URL. Set it in the repo root .env (see .env.example), or set DATABASE_URL.",
          }),
        )
      }

      return {
        supabaseUrl,
        supabaseServiceKey,
        targetDatabaseUrl: Redacted.make(targetDatabaseUrl),
        legacyDatabaseUrl: Redacted.make(legacyDatabaseUrl.value),
      }
    }),
  },
) {
  static readonly layer = Layer.effect(this, this.make)
}
