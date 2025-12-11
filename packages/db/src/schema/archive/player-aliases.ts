import { integer, pgTable, text, boolean, serial } from "drizzle-orm/pg-core"
import { withTimestamp } from "../../helpers/with-timestamp"

export const playerAliasesTable = pgTable("player_aliases", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").notNull(),
  alias: text("alias").notNull(),
  public: boolean("public").notNull().default(false),
  ...withTimestamp,
})

export type PlayerAliases = typeof playerAliasesTable.$inferSelect
export type NewPlayerAliases = typeof playerAliasesTable.$inferInsert
