import { relations } from "drizzle-orm"
import { playerAliasesTable } from "./player-aliases"
import { playerAliasesToPlayerHistory } from "./player-aliases-to-history"

export const playerAliasesRelations = relations(
  playerAliasesTable,
  ({ many }) => ({
    playerHistory: many(playerAliasesToPlayerHistory),
  }),
)
