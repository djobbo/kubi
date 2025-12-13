import { pgTable, primaryKey, uuid } from "drizzle-orm/pg-core"
import { playerAliasesTable } from "./player-aliases"
import { playerHistoryTable } from "./player-history"
import { relations } from "drizzle-orm"

export const playerAliasesToPlayerHistory = pgTable(
  "player_aliases_to_player_history",
  {
    playerAliasId: uuid("player_alias_id").references(
      () => playerAliasesTable.id,
    ),
    playerHistoryId: uuid("player_history_id").references(
      () => playerHistoryTable.id,
    ),
  },
  (t) => [primaryKey({ columns: [t.playerAliasId, t.playerHistoryId] })],
)

export const playerAliasesToPlayerHistoryRelations = relations(
  playerAliasesToPlayerHistory,
  ({ one }) => ({
    playerAlias: one(playerAliasesTable, {
      fields: [playerAliasesToPlayerHistory.playerAliasId],
      references: [playerAliasesTable.id],
    }),
  }),
)
