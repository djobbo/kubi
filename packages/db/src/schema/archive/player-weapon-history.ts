import { relations } from "drizzle-orm"
import {
  bigint,
  index,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core"
import { withTimestamp } from "../../helpers/with-timestamp"
import { playerHistoryTable } from "./player-history"

/**
 * Player weapon history table storing historical weapon-specific stats per player.
 * Aggregated from legend weapon stats (weapon_one and weapon_two) across all legends.
 */
export const playerWeaponHistoryTable = pgTable(
  "player_weapon_history",
  {
    id: serial("id").primaryKey(),
    playerHistoryId: bigint("player_history_id", { mode: "number" })
      .notNull()
      .references(() => playerHistoryTable.id, { onDelete: "cascade" }),
    playerId: bigint("player_id", { mode: "number" }).notNull(),
    recordedAt: timestamp("recorded_at", { withTimezone: true }).notNull(),

    // Weapon identification
    weaponName: text("weapon_name").notNull(), // e.g., "Axe", "Bow", "Blasters", etc.

    // Extracted columns: frequently queried fields
    // From PlayerWeapon.stats (packages/api-contract)
    // Aggregated from all legends using this weapon
    games: bigint("games", { mode: "number" }),
    wins: bigint("wins", { mode: "number" }),
    kos: bigint("kos", { mode: "number" }),
    damageDealt: bigint("damage_dealt", { mode: "number" }),
    timeHeld: bigint("time_held", { mode: "number" }),
    level: bigint("level", { mode: "number" }),
    xp: bigint("xp", { mode: "number" }),
    // Computed winrate: (wins / games) * 100
    winrate: bigint("winrate", { mode: "number" }),
    ...withTimestamp,
  },
  (table) => [
    // Index for querying a player's weapon history
    index("idx_player_weapon_recorded").on(
      table.playerId,
      table.weaponName,
      table.recordedAt,
    ),
    // Indexes for ranking queries per weapon
    index("idx_weapon_wins").on(table.weaponName, table.wins),
    index("idx_weapon_games").on(table.weaponName, table.games),
    index("idx_weapon_kos").on(table.weaponName, table.kos),
    index("idx_weapon_winrate").on(table.weaponName, table.winrate),
    // Index for player's best weapons
    index("idx_player_weapon_wins").on(table.playerId, table.wins),
  ],
)

export type PlayerWeaponHistory = typeof playerWeaponHistoryTable.$inferSelect
export type NewPlayerWeaponHistory =
  typeof playerWeaponHistoryTable.$inferInsert

export const playerWeaponHistoryRelations = relations(
  playerWeaponHistoryTable,
  ({ one }) => ({
    playerHistory: one(playerHistoryTable, {
      fields: [playerWeaponHistoryTable.playerHistoryId],
      references: [playerHistoryTable.id],
    }),
  }),
)
