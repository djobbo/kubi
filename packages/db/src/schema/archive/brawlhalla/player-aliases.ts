import {
  bigint,
  pgTable,
  text,
  boolean,
  uuid,
  index,
} from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"
import { withRecordedAt } from "../../../helpers/with-timestamp"

export const playerAliasesTable = pgTable(
  "brawlhalla_player_aliases",
  {
    id: uuid("id").primaryKey().default(sql`uuidv7()`).primaryKey(),

    playerId: bigint("player_id", { mode: "number" }).notNull(),

    alias: text("alias").notNull(),
    public: boolean("public").notNull().default(false),
    ...withRecordedAt,
  },
  (table) => [
    index("idx_brawlhalla_player_alias_recorded").on(
      table.playerId,
      table.alias,
      table.recordedAt,
    ),
    index("idx_brawlhalla_player_alias").on(table.alias),
    index("idx_brawlhalla_player_alias_recorded_at").on(table.recordedAt),
    index("idx_brawlhalla_player_public_recorded_at").on(
      table.public,
      table.recordedAt,
    ),
    index("idx_brawlhalla_player_aliases_player_id").on(table.playerId),
  ],
)

export type PlayerAliases = typeof playerAliasesTable.$inferSelect
export type NewPlayerAliases = typeof playerAliasesTable.$inferInsert
