import postgres from "postgres"
import { Context, Effect, Layer, Redacted } from "effect"

import { MigrationConfig } from "../config"
import { MigrationFetchError } from "../errors"

export class LegacyPostgres extends Context.Service<LegacyPostgres>()(
  "@dair/migrator/LegacyPostgres",
  {
    make: Effect.gen(function* () {
      const config = yield* MigrationConfig
      const sql = postgres(Redacted.value(config.legacyDatabaseUrl))

      const fetchBookmarksPage = Effect.fn("LegacyPostgres.fetchBookmarksPage")(
        function* (offset: number, limit: number) {
          return yield* Effect.tryPromise({
            try: () =>
              sql`
                SELECT
                    to_jsonb(uf.*) AS favorite_data,
                    to_jsonb(up) AS profile_data,
                    to_jsonb(u) AS user_data
                FROM
                    public."UserFavorite" uf
                JOIN
                    public."UserProfile" up ON uf."userId" = up.id
                JOIN
                    auth."users" u ON up.id = u.id
                LIMIT ${limit} OFFSET ${offset};
              `,
            catch: (cause) =>
              new MigrationFetchError({
                message: "Failed to fetch bookmarks",
                cause,
              }),
          })
        },
      )

      const fetchBookmarksForDiscord = Effect.fn(
        "LegacyPostgres.fetchBookmarksForDiscord",
      )(function* (discordId: string) {
        return yield* Effect.tryPromise({
          try: () =>
            sql`
              SELECT
                  to_jsonb(uf.*) AS favorite_data,
                  to_jsonb(up) AS profile_data,
                  to_jsonb(u) AS user_data
              FROM
                  public."UserFavorite" uf
              JOIN
                  public."UserProfile" up ON uf."userId" = up.id
              JOIN
                  auth."users" u ON up.id = u.id
              WHERE
                  u.raw_user_meta_data->>'provider_id' = ${discordId};
            `,
          catch: (cause) =>
            new MigrationFetchError({
              message: `Failed to fetch bookmarks for Discord user ${discordId}`,
              cause,
            }),
        })
      })

      return { fetchBookmarksPage, fetchBookmarksForDiscord }
    }),
  },
) {
  static readonly layer = Layer.effect(this, this.make).pipe(
    Layer.provide(MigrationConfig.layer),
  )
}
