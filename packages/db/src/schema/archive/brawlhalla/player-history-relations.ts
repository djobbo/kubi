import { relations } from "drizzle-orm"
import { playerLegendHistoryTable } from "./player-legend-history"
import { playerWeaponHistoryTable } from "./player-weapon-history"
import { playerHistoryTable } from "./player-history"

export const playerHistoryRelations = relations(
  playerHistoryTable,
  ({ many }) => ({
    legendHistory: many(playerLegendHistoryTable),
    weaponHistory: many(playerWeaponHistoryTable),
  }),
)
