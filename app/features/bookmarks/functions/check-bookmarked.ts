import { createServerFn } from "@tanstack/react-start"
import { and, eq } from "drizzle-orm"
import { z } from "zod"

import { db } from "@/db"
import { getSession } from "@/features/auth/functions/getSession"

import { bookmarksTable, pageTypeSchema } from "../schema/bookmarks"

const bookmarksDeleteQuerySchema = z.object({
  pageType: pageTypeSchema,
  pageId: z.string(),
})

export const checkBookmarked = createServerFn({ method: "GET" })
  .validator(z.object({ bookmark: bookmarksDeleteQuerySchema }))
  .handler(async ({ data: { bookmark } }) => {
    // TODO: CRSF protection
    const { user } = await getSession()

    if (!user) {
      throw new Error("Unauthorized")
    }

    const bookmarks = await db
      .select()
      .from(bookmarksTable)
      .where(
        and(
          eq(bookmarksTable.userId, user.id),
          eq(bookmarksTable.pageType, bookmark.pageType),
          eq(bookmarksTable.pageId, bookmark.pageId),
        ),
      )
      .execute()

    return bookmarks.length > 0
  })
