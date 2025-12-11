import { integer, pgTable, text, boolean, uuid } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"
import { withTimestamp } from "../../helpers/with-timestamp"

export const playerAliasesTable = pgTable("player_aliases", {
  id: uuid("id").primaryKey().default(sql`uuidv7()`).primaryKey(),

  playerId: integer("player_id").notNull(),
  alias: text("alias").notNull(),
  public: boolean("public").notNull().default(false),
  ...withTimestamp,
})

export type PlayerAliases = typeof playerAliasesTable.$inferSelect
export type NewPlayerAliases = typeof playerAliasesTable.$inferInsert
