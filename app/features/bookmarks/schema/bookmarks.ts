import type { InferSelectModel } from "drizzle-orm"
import { json, serial, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core"
import { createInsertSchema } from "drizzle-zod"
import { z } from "zod"

import { usersTable } from "@/features/auth/schema/users"

import { bookmarksSchema } from "./schema"

const pageTypes = ["player_stats", "clan_stats"] as const

export const pageTypeSchema = z.enum(pageTypes)

export const pageTypeEnum = bookmarksSchema.enum("page_type", pageTypes)

export const playerStatsMetaSchema = z.object({
  icon: z.union([
    z.object({
      type: z.literal("legend"),
      id: z.number(),
    }),
    z.object({
      type: z.literal("url"),
      url: z.string(),
    }),
  ]),
})

const metaSchema = z.union([
  z.object({
    type: z.literal("player_stats"),
    icon: playerStatsMetaSchema,
  }),
  z.object({
    type: z.literal("clan_stats"),
  }),
])

type Meta = z.infer<typeof metaSchema>

export const bookmarksTable = bookmarksSchema.table(
  "bookmarks",
  {
    id: serial("id").primaryKey(),
    pageType: pageTypeEnum("page_type").notNull(),
    pageId: text("page_id").notNull(),
    name: text("name").notNull(),
    meta: json("meta").$type<Meta>(),
    userId: text("user_id")
      .notNull()
      .references(() => usersTable.id),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
  },
  (table) => ({
    uniqueBookmark: uniqueIndex("unique_bookmark").on(
      table.userId,
      table.pageType,
      table.pageId,
    ),
  }),
)

export type Bookmark = InferSelectModel<typeof bookmarksTable>

export const bookmarksInsertSchema = createInsertSchema(bookmarksTable, {
  pageType: pageTypeSchema,
  meta: metaSchema,
  userId: z.string().optional(),
})
