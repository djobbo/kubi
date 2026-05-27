import { pgTable, text, uniqueIndex, uuid, jsonb } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

import { withTimestamp } from "../../helpers/with-timestamp"
import { type BookmarkMeta, pageTypes } from "./bookmarks"

export const legacyBookmarksTable = pgTable(
  "legacy_bookmarks",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuidv7()`),
    pageType: text("page_type", { enum: pageTypes }).notNull(),
    pageId: text("page_id").notNull(),
    name: text("name").notNull(),
    meta: jsonb("meta").$type<BookmarkMeta>(),
    discordId: text("discord_id").notNull(),
    ...withTimestamp,
  },
  (table) => [
    uniqueIndex("unique_legacy_bookmark").on(
      table.discordId,
      table.pageType,
      table.pageId,
    ),
  ],
)

export type LegacyBookmark = typeof legacyBookmarksTable.$inferSelect
export type NewLegacyBookmark = typeof legacyBookmarksTable.$inferInsert
