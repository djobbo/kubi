import { sql as drizzleSql } from "drizzle-orm"
import { Context, Effect, Layer, Schema } from "effect"

import { legacyBookmarksTable } from "@dair/db"

import { MigrationDatabase } from "../db"
import { MigrationFetchError, MigrationWriteError } from "../errors"
import { LegacyPostgres } from "../legacy-postgres"
import { LegacySupabase } from "../legacy-supabase"
import { bookmarkSchema, parseLegacyBookmarks } from "./schema"

export class BookmarksMigration extends Context.Service<BookmarksMigration>()(
  "@dair/migrator/BookmarksMigration",
  {
    make: Effect.gen(function* () {
      const db = yield* MigrationDatabase
      const { client } = yield* LegacySupabase
      const legacyPostgres = yield* LegacyPostgres

      const decodeLegacyBookmarks = (rawBookmarks: unknown) =>
        Schema.decodeUnknownEffect(bookmarkSchema)(rawBookmarks).pipe(
          Effect.map(parseLegacyBookmarks),
          Effect.mapError(
            (cause) =>
              new MigrationFetchError({
                message: "Failed to decode legacy bookmarks",
                cause,
              }),
          ),
        )

      const migrateBatch = Effect.fn("BookmarksMigration.migrateBatch")(
        function* (offset: number, limit: number) {
          const rawBookmarks = yield* legacyPostgres.fetchBookmarksPage(
            offset,
            limit,
          )

          const legacyBookmarks = yield* decodeLegacyBookmarks(rawBookmarks)

          if (legacyBookmarks.length === 0) {
            yield* Effect.log("No legacy bookmarks in batch", { offset, limit })
            return
          }

          yield* db
            .insert(legacyBookmarksTable)
            .values([...legacyBookmarks])
            .onConflictDoUpdate({
              set: {
                name: drizzleSql`excluded.name`,
              },
              target: [
                legacyBookmarksTable.provider,
                legacyBookmarksTable.providerUserId,
                legacyBookmarksTable.pageId,
                legacyBookmarksTable.pageType,
              ],
            })
            .pipe(
              Effect.mapError(
                (cause) =>
                  new MigrationWriteError({
                    message: "Failed to stage legacy bookmarks",
                    cause,
                  }),
              ),
            )

          yield* Effect.log("Staged legacy bookmarks batch", {
            offset,
            limit,
            count: legacyBookmarks.length,
          })
        },
      )

      const migrateAll = Effect.fn("BookmarksMigration.migrateAll")(function* (
        batchSize: number,
      ) {
        const { count, error, status } = yield* Effect.tryPromise({
          try: () =>
            client
              .from("UserFavorite")
              .select("*", { count: "exact", head: true }),
          catch: (cause) =>
            new MigrationFetchError({
              message: "Failed to count bookmarks",
              cause,
            }),
        })

        if (error || status !== 200) {
          return yield* Effect.fail(
            new MigrationFetchError({
              message: "Failed to count bookmarks",
              cause: error,
            }),
          )
        }

        const total = count ?? 0
        yield* Effect.log(`Staging ${total} legacy bookmarks`)

        for (let offset = 0; offset < total; offset += batchSize) {
          yield* migrateBatch(offset, batchSize)
        }

        yield* Effect.log("Finished staging legacy bookmarks")
      })

      return { migrateAll, migrateBatch }
    }),
  },
) {
  static readonly layer = Layer.effect(this, this.make).pipe(
    Layer.provide(MigrationDatabase.layer),
    Layer.provide(LegacySupabase.layer),
    Layer.provide(LegacyPostgres.layer),
  )
}
