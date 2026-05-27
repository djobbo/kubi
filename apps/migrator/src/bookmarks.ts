import { sql as drizzleSql } from "drizzle-orm"
import { Schema } from "effect"
import postgres from "postgres"

import { placeholderUserIdFromDiscord } from "@dair/common/src/constants/bookmarks"
import {
  type NewBookmark,
  bookmarksTable,
  usersTable,
} from "@dair/db"

import { supabase } from "./client"
import { migrationDb } from "./db"
import { MIGRATION_SUPABASE_DATABASE_URL } from "./env"

const sql = postgres(MIGRATION_SUPABASE_DATABASE_URL)

const bookmarkSchema = Schema.Array(
  Schema.Struct({
    favorite_data: Schema.Struct({
      id: Schema.String,
      name: Schema.String,
      type: Schema.Literals(["clan", "player"]),
      userId: Schema.String,
      meta: Schema.Struct({
        icon: Schema.optional(
          Schema.Struct({
            legend_id: Schema.Number,
            type: Schema.Literals(["legend"]),
          }),
        ),
      }),
    }),
    profile_data: Schema.Struct({
      id: Schema.String,
      username: Schema.String,
      avatarUrl: Schema.optional(Schema.String),
    }),
    user_data: Schema.Struct({
      id: Schema.String,
      created_at: Schema.String,
      updated_at: Schema.String,
      raw_app_meta_data: Schema.Struct({
        provider: Schema.Literals(["discord"]),
      }),
      raw_user_meta_data: Schema.Struct({
        name: Schema.String,
        email: Schema.String,
        picture: Schema.String,
        full_name: Schema.String,
        avatar_url: Schema.String,
        provider_id: Schema.String,
      }),
    }),
  }),
)

const parseOldBookmarks = (rawBookmarks: unknown, userId?: string) => {
  const bookmarks = Schema.decodeUnknownSync(bookmarkSchema)(rawBookmarks)
  const migratedBookmarks: NewBookmark[] = bookmarks
    .map((bookmark): NewBookmark | null => {
      if (!["player", "clan"].includes(bookmark.favorite_data.type)) {
        return null
      }

      if (bookmark.user_data.raw_app_meta_data.provider !== "discord") {
        return null
      }

      const pageType =
        bookmark.favorite_data.type === "player" ? "player_stats" : "clan_stats"

      const icon = bookmark.favorite_data.meta?.icon

      const tempId = placeholderUserIdFromDiscord(
        bookmark.user_data.raw_user_meta_data.provider_id,
      )

      return {
        name: bookmark.favorite_data.name,
        pageId: bookmark.favorite_data.id,
        userId: userId ?? tempId,
        createdAt: new Date(),
        pageType,
        meta: {
          version: "1",
          data: {
            icon: icon?.legend_id
              ? {
                  type: "legend",
                  id: icon.legend_id,
                }
              : null,
          },
        },
      }
    })
    .filter((bookmark): bookmark is NewBookmark => bookmark !== null)

  return migratedBookmarks
}

export const getOldUserBookmarks = async (
  userId: string,
  discordId: string,
) => {
  const rawBookmarks = await sql`
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
`.catch((error) => {
    console.error(error, { userId, discordId })
    throw new Error(`Failed to fetch bookmarks for user ${userId}`)
  })

  return parseOldBookmarks(rawBookmarks, userId)
}

const migrateBookmarks = async (offset: number, limit: number) => {
  console.time("Migrate bookmarks")

  // To migrate a single user's bookmarks, add the following WHERE clause:
  // WHERE
  //   u.raw_user_meta_data->>'provider_id' = 'DISCORD_USER_ID'

  const rawBookmarks = await sql`
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
`.catch((error) => {
    console.error(error, { offset, limit })
    throw new Error("Failed to fetch bookmarks")
  })

  const bookmarks = parseOldBookmarks(rawBookmarks)

  const tempUsers = bookmarks
    .map((bookmark) => ({
      id: bookmark.userId,
      email: `migration+${bookmark.userId}@placeholder.local`,
      username: `migration-${bookmark.userId.slice(0, 8)}`,
    }))
    .filter(
      (user, index, self) => self.findIndex((u) => u.id === user.id) === index,
    )

  try {
    // Insert temporary user to avoid foreign key constraint
    await migrationDb
      .insert(usersTable)
      .values(tempUsers)
      .onConflictDoNothing()
      .execute()

    await migrationDb
      .insert(bookmarksTable)
      .values(bookmarks)
      .onConflictDoUpdate({
        set: {
          name: drizzleSql`excluded.name`,
        },
        target: [
          bookmarksTable.userId,
          bookmarksTable.pageId,
          bookmarksTable.pageType,
        ],
      })
      .execute()
  } catch (error) {
    console.error(error, { offset, limit })
    throw new Error("Failed to migrate bookmarks")
  }

  console.timeEnd("Migrate bookmarks")
  console.log("Migrated bookmarks", { offset, limit })
}

export const migrateAllBookmarks = async (maxBookmarks: number) => {
  console.time("Migrate all bookmarks")

  const { count } = await supabase
    .from("UserFavorite")
    .select("*", { count: "exact", head: true })

  console.log(`Migrating ${count} bookmarks`)

  for (let offset = 0; offset < (count ?? 0); offset += maxBookmarks) {
    await migrateBookmarks(offset, maxBookmarks)
  }

  console.timeEnd("Migrate all bookmarks")
}
