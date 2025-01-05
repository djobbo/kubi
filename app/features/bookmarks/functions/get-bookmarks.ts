import { createServerFn } from "@tanstack/start"
import { and, desc, eq, inArray } from "drizzle-orm"
import { z } from "zod"

import { db } from "@/db"
import type { User } from "@/db/schema"
import {
  DISCORD_PROVIDER_ID,
  oauthAccountsTable,
  usersTable,
} from "@/db/schema"
import { getSession } from "@/features/auth/functions/getSession"

import { getTempUserId } from "../migration"
import { bookmarksTable, pageTypeSchema } from "../schema/bookmarks"

const bookmarksQuerySchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
  pageType: z.array(pageTypeSchema).optional(),
})

export type BookmarksQuery = z.infer<typeof bookmarksQuerySchema>

const migrateLegacyBookmarks = async (user: User) => {
  const oauthData = await db
    .select()
    .from(oauthAccountsTable)
    .where(
      and(
        eq(oauthAccountsTable.userId, user.id),
        eq(oauthAccountsTable.providerId, DISCORD_PROVIDER_ID),
      ),
    )
    .execute()

  const discordOauthData = oauthData[0]

  if (!discordOauthData.providerUserId) {
    return
  }

  const tempUserId = getTempUserId(discordOauthData.providerUserId)

  const tempBookmarks = await db
    .delete(bookmarksTable)
    .where(eq(bookmarksTable.userId, tempUserId))
    .returning()
    .execute()

  if (tempBookmarks.length <= 0) {
    return
  }

  await db
    .insert(bookmarksTable)
    .values(tempBookmarks.map((bookmark) => ({ ...bookmark, userId: user.id })))
    .onConflictDoNothing()
    .execute()

  // try deleting temporary user
  try {
    await db.delete(usersTable).where(eq(usersTable.id, tempUserId)).execute()
  } catch (error) {
    console.error("Failed to delete temporary user", error, { tempUserId })
  }
}

export const getBookmarks = createServerFn({ method: "GET" })
  .validator(
    z.object({
      query: bookmarksQuerySchema.optional(),
    }),
  )
  .handler(async ({ data: { query } }) => {
    // TODO: CRSF protection
    const { user } = await getSession()

    if (!user) {
      throw new Error("Unauthorized")
    }

    const { page = 1, limit = 10, pageType = [] } = query ?? {}

    // TODO: check if migration is needed
    await migrateLegacyBookmarks(user)

    const bookmarks = await db
      .select()
      .from(bookmarksTable)
      .orderBy(desc(bookmarksTable.createdAt))
      .where(
        pageType.length <= 0
          ? eq(bookmarksTable.userId, user.id)
          : and(
              eq(bookmarksTable.userId, user.id),
              inArray(bookmarksTable.pageType, pageType),
            ),
      )
      .limit(limit)
      .offset((page - 1) * limit)
      .execute()

    return bookmarks
  })
