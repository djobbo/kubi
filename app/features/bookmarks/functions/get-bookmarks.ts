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

    const bookmarks = await db
      .select()
      .from(bookmarksTable)
      .where(inArray(bookmarksTable.pageType, pageType))
      .orderBy(desc(bookmarksTable.createdAt))
      .limit(limit)
      .offset((page - 1) * limit)
      .execute()

    return bookmarks
  })
