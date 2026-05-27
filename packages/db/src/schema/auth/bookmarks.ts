import { sql } from "drizzle-orm"
import { relations } from "drizzle-orm/_relations"
import {
  jsonb,
  pgTable,
  text,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core"

import { withTimestamp } from "../../helpers/with-timestamp"
import { usersTable } from "./users"

export const pageTypes = ["player_stats", "clan_stats"] as const
export type PageType = (typeof pageTypes)[number]

export type BookmarkMeta = {
  readonly version: "1"
  readonly data: {
    readonly icon:
      | {
          readonly type: "legend"
          readonly id?: number
        }
      | {
          readonly type: "url"
          readonly url: string
        }
      | null
  }
} | null

export const bookmarksTable = pgTable(
  "bookmarks",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuidv7()`),
    pageType: text("page_type", { enum: pageTypes }).notNull(),
    pageId: text("page_id").notNull(),
    name: text("name").notNull(),
    meta: jsonb("meta").$type<BookmarkMeta>(),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    ...withTimestamp,
  },
  (table) => [
    uniqueIndex("unique_bookmark").on(
      table.userId,
      table.pageType,
      table.pageId,
    ),
  ],
)

export type Bookmark = typeof bookmarksTable.$inferSelect
export type NewBookmark = typeof bookmarksTable.$inferInsert

export const bookmarksRelations = relations(bookmarksTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [bookmarksTable.userId],
    references: [usersTable.id],
  }),
}))
