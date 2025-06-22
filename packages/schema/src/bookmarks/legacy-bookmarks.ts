import {
	integer,
	sqliteTable,
	text,
	uniqueIndex,
} from "drizzle-orm/sqlite-core"
import { createInsertSchema } from "drizzle-zod"
import { z } from "zod/v4"
import { withTimestamp } from "../helpers/with-timestamp"
import {
	type Meta,
	metaSchema,
	pageTypeEnum,
	pageTypeSchema,
} from "./bookmarks"

export const legacyBookmarksTable = sqliteTable(
	"legacy_bookmarks",
	{
		id: integer("id").primaryKey({ autoIncrement: true }),
		pageType: pageTypeEnum("page_type").notNull(),
		pageId: text("page_id").notNull(),
		name: text("name").notNull(),
		meta: text("meta", { mode: "json" }).$type<Meta>(),
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

export const legacyBookmarksInsertSchema = createInsertSchema(
	legacyBookmarksTable,
	{
		pageType: pageTypeSchema,
		meta: metaSchema,
		discordId: z.string(),
	},
)
