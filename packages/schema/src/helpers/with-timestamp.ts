import { sql } from "drizzle-orm"
import { type SQLiteColumnBuilderBase, integer } from "drizzle-orm/sqlite-core"

export const withTimestamp = {
	createdAt: integer("created_at", { mode: "timestamp_ms" })
		.notNull()
		.default(sql`(unixepoch() * 1000)`),
	updatedAt: integer("updated_at", { mode: "timestamp_ms" })
		.notNull()
		.default(sql`(unixepoch() * 1000)`),
} as const satisfies Record<string, SQLiteColumnBuilderBase>

export const withExpiry = {
	expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
} as const satisfies Record<string, SQLiteColumnBuilderBase>
