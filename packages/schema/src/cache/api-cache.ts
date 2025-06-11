import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { withTimestamp } from '../helpers/with-timestamp'

export const apiCacheTable = sqliteTable("api-cache", {
	cacheName: text("cacheName").notNull(),
	cacheId: text("cacheId").primaryKey(),
	data: text("data", { mode: "json" }),
	version: integer("version").notNull(),
	...withTimestamp,
})

export type ApiCache = typeof apiCacheTable.$inferSelect
export type NewApiCache = typeof apiCacheTable.$inferInsert
