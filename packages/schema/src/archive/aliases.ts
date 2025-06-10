import { sql } from "drizzle-orm"
import {
	integer,
	sqliteTable,
	text,
	uniqueIndex,
} from "drizzle-orm/sqlite-core"
import { createInsertSchema } from "drizzle-zod"
import type { z } from "zod"

export const aliasesTable = sqliteTable(
	"aliases",
	{
		id: integer("id").primaryKey({ autoIncrement: true }),
		alias: text("alias").notNull(),
		playerId: text("player_id").notNull(),
		createdAt: integer("createdAt", { mode: "timestamp_ms" })
			.notNull()
			.default(sql`(unixepoch() * 1000)`),
		updatedAt: integer("updatedAt", { mode: "timestamp_ms" })
			.notNull()
			.default(sql`(unixepoch() * 1000)`),
		public: integer("public", { mode: "boolean" }).notNull().default(true),
	},
	(table) => [uniqueIndex("unique_alias").on(table.playerId, table.alias)],
)

export type Alias = typeof aliasesTable.$inferSelect
export type NewAlias = typeof aliasesTable.$inferInsert

export const aliasesInsertSchema = createInsertSchema(aliasesTable)
