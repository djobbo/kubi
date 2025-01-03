import { createServerFn } from "@tanstack/start"
import { desc, inArray } from "drizzle-orm"
import { z } from "zod"

import { db } from "@/db"

import { bookmarksTable, pageTypeSchema } from "../schema/bookmarks"

const bookmarksQuerySchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
  pageType: z.array(pageTypeSchema).optional(),
})

export type BookmarksQuery = z.infer<typeof bookmarksQuerySchema>

export const getBookmarks = createServerFn({ method: "GET" })
  .validator(
    z.object({
      query: bookmarksQuerySchema.optional(),
    }),
  )
  .handler(async ({ data: { query } }) => {
    const { page = 1, limit = 10, pageType = [] } = query ?? {}

    const bookmarksQuery = db
      .select()
      .from(bookmarksTable)
      .orderBy(desc(bookmarksTable.createdAt))
      .limit(limit)
      .offset((page - 1) * limit)

    if (pageType.length <= 0) {
      const bookmarks = await bookmarksQuery.execute()
      return bookmarks
    }

    const bookmarks = await bookmarksQuery //
      .where(inArray(bookmarksTable.pageType, pageType))
      .execute()

    return bookmarks
  })
