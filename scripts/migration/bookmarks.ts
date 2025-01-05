import { sql as drizzleSql } from "drizzle-orm"
import postgres from "postgres"
import { z } from "zod"

import { db } from "@/db"
import type { NewBookmark } from "@/db/schema"
import { bookmarksTable, usersTable } from "@/db/schema"
import { PRE_MIGRATION_DISCORD_USER_ID_PREFIX } from "@/features/bookmarks/constants"

import { supabase } from "./client"
import { SUPABASE_DATABASE_URL } from "./env"

const sql = postgres(SUPABASE_DATABASE_URL)

const migrateBookmarks = async (offset: number, limit: number) => {
  console.time("Migrate bookmarks")

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

  const bookmarks = z
    .array(
      z.object({
        favorite_data: z.object({
          id: z.string(),
          name: z.string(),
          type: z.union([z.literal("clan"), z.literal("player")]),
          userId: z.string(),
          meta: z.object({
            icon: z
              .object({
                legend_id: z.number(),
                type: z.literal("legend"),
              })
              .optional(),
          }),
        }),
        profile_data: z.object({
          id: z.string(),
          username: z.string(),
          avatarUrl: z.string().optional(),
        }),
        user_data: z.object({
          id: z.string(),
          created_at: z.string(),
          updated_at: z.string(),
          raw_app_meta_data: z.object({
            provider: z.literal("discord"),
          }),
          raw_user_meta_data: z.object({
            name: z.string(),
            email: z.string(),
            picture: z.string(),
            full_name: z.string(),
            avatar_url: z.string(),
            provider_id: z.string(),
          }),
        }),
      }),
    )
    .parse(rawBookmarks)

  const migratedBookmarks = bookmarks
    .map((bookmark) => {
      if (!["player", "clan"].includes(bookmark.favorite_data.type)) {
        return null
      }

      if (bookmark.user_data.raw_app_meta_data.provider !== "discord") {
        return null
      }

      const pageType =
        bookmark.favorite_data.type === "player" ? "player_stats" : "clan_stats"

      const icon = bookmark.favorite_data.meta?.icon

      return {
        name: bookmark.favorite_data.name,
        pageId: bookmark.favorite_data.id,
        userId: `${PRE_MIGRATION_DISCORD_USER_ID_PREFIX}${bookmark.user_data.raw_user_meta_data.provider_id}`,
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
      } as const satisfies NewBookmark
    })
    .filter((bookmark) => !!bookmark)

  const tempUsers = migratedBookmarks
    .map((bookmark) => ({
      id: bookmark.userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      email: "",
    }))
    .filter(
      (user, index, self) => self.findIndex((u) => u.id === user.id) === index,
    )

  try {
    // Insert temporary user to avoid foreign key constraint
    await db
      .insert(usersTable)
      .values(tempUsers)
      .onConflictDoNothing()
      .execute()

    await db
      .insert(bookmarksTable)
      .values(migratedBookmarks)
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

await migrateBookmarks(0, 20)

export const migrateAllBookmarks = async (maxBookmarks: number) => {
  console.time("Migrate all bookmarks")

  const { count } = await supabase
    .from("BHPlayerAlias")
    .select("*", { count: "exact", head: true })

  console.log(`Migrating ${count} bookmarks`)

  for (let offset = 0; offset < (count ?? 0); offset += maxBookmarks) {
    await migrateBookmarks(offset, maxBookmarks)
  }

  console.timeEnd("Migrate all bookmarks")
}
