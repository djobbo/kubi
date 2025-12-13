import {
  bigint,
  pgTable,
  text,
  boolean,
  uuid,
  index,
} from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"
import { withTimestamp } from "../../helpers/with-timestamp"

export const playerAliasesTable = pgTable(
  "player_aliases",
  {
    id: uuid("id").primaryKey().default(sql`uuidv7()`).primaryKey(),

    playerId: bigint("player_id", { mode: "number" }).notNull(),

    alias: text("alias").notNull(),
    public: boolean("public").notNull().default(false),
    ...withTimestamp,
  },
  (table) => [
    index("idx_alias").on(table.alias),
    index("idx_created_at").on(table.createdAt),
    index("idx_public_created_at").on(table.public, table.createdAt),
    index("idx_player_id").on(table.playerId),
  ],
)

export type PlayerAliases = typeof playerAliasesTable.$inferSelect
export type NewPlayerAliases = typeof playerAliasesTable.$inferInsert
