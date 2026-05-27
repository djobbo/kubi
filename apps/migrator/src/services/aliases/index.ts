import { sql } from "drizzle-orm"
import { Context, Effect, Layer } from "effect"

import { type NewPlayerAliases, playerAliasesTable } from "@dair/db"

import { MigrationDatabase } from "../db"
import { MigrationFetchError, MigrationWriteError } from "../errors"
import { LegacySupabase } from "../legacy-supabase"

export class AliasesMigration extends Context.Service<AliasesMigration>()(
  "@dair/migrator/AliasesMigration",
  {
    make: Effect.gen(function* () {
      const db = yield* MigrationDatabase
      const { client } = yield* LegacySupabase

      const migrateBatch = Effect.fn("AliasesMigration.migrateBatch")(
        function* (offset: number, limit: number) {
          const aliases = yield* Effect.tryPromise({
            try: () =>
              client
                .from("BHPlayerAlias")
                .select("*")
                .range(offset, offset + limit - 1),
            catch: (cause) =>
              new MigrationFetchError({
                message: "Failed to fetch aliases",
                cause,
              }),
          })

          if (aliases.error || aliases.status !== 200) {
            return yield* Effect.fail(
              new MigrationFetchError({
                message: "Failed to fetch aliases",
                cause: aliases.error,
              }),
            )
          }

          const migratedAliases: NewPlayerAliases[] =
            aliases.data?.map((alias) => ({
              alias: alias.alias,
              recordedAt: new Date(alias.createdAt),
              playerId: Number(alias.playerId),
              public: alias.public,
            })) ?? []

          yield* db
            .insert(playerAliasesTable)
            .values(migratedAliases)
            .onConflictDoUpdate({
              set: {
                public: sql`excluded.public`,
              },
              target: [playerAliasesTable.playerId, playerAliasesTable.alias],
            })
            .pipe(
              Effect.mapError(
                (cause) =>
                  new MigrationWriteError({
                    message: "Failed to migrate aliases",
                    cause,
                  }),
              ),
            )

          yield* Effect.log("Migrated aliases batch", { offset, limit })
        },
      )

      const migrateAll = Effect.fn("AliasesMigration.migrateAll")(function* (
        batchSize: number,
      ) {
        const { count, error, status } = yield* Effect.tryPromise({
          try: () =>
            client
              .from("BHPlayerAlias")
              .select("*", { count: "exact", head: true }),
          catch: (cause) =>
            new MigrationFetchError({
              message: "Failed to count aliases",
              cause,
            }),
        })

        if (error || status !== 200) {
          return yield* Effect.fail(
            new MigrationFetchError({
              message: "Failed to count aliases",
              cause: error,
            }),
          )
        }

        const total = count ?? 0
        yield* Effect.log(`Migrating ${total} aliases`)

        for (let offset = 0; offset < total; offset += batchSize) {
          yield* migrateBatch(offset, batchSize)
        }

        yield* Effect.log("Finished migrating aliases")
      })

      return { migrateAll, migrateBatch }
    }),
  },
) {
  static readonly layer = Layer.effect(this, this.make).pipe(
    Layer.provide(MigrationDatabase.layer),
    Layer.provide(LegacySupabase.layer),
  )
}
