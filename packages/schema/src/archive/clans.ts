import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { createInsertSchema } from "drizzle-zod"
import { withTimestamp } from "../helpers/with-timestamp"

export const clansTable = sqliteTable("clans", {
  id: text("clan_id").notNull().primaryKey(),
  name: text("name").notNull(),
  clanCreatedAt: integer("clan_created_at", { mode: "timestamp_ms" }),
  xp: integer("xp").notNull().default(0),
  ...withTimestamp,
})

export type ArchivedClan = typeof clansTable.$inferSelect
export type NewArchivedClan = typeof clansTable.$inferInsert

export const clanInsertSchema = createInsertSchema(clansTable)
