import { relations, sql } from "drizzle-orm"
import { bigint, index, pgTable, uuid, text } from "drizzle-orm/pg-core"
import { playerHistoryTable } from "./player-history"
import { withRecordedAt } from "../../../helpers/with-timestamp"

/**
 * Player weapon history table storing historical weapon-specific stats per player.
 * Aggregated from legend weapon stats (weapon_one and weapon_two) across all legends.
 */
export const playerWeaponHistoryTable = pgTable(
  "brawlhalla_player_weapon_history",
  {
    id: uuid("id").primaryKey().default(sql`uuidv7()`),

    playerHistoryId: uuid("player_history_id")
      .notNull()
      .references(() => playerHistoryTable.id, { onDelete: "cascade" }),
    playerId: bigint("player_id", { mode: "number" }).notNull(),
    playerName: text("player_name").notNull(),
    ...withRecordedAt,

    // Weapon identification
    weaponName: text("weapon_name").notNull(), // e.g., "Axe", "Bow", "Blasters", etc.

    // Extracted columns: frequently queried fields
    // From PlayerWeapon.stats (packages/api-contract)
    // Aggregated from all legends using this weapon
    games: bigint("games", { mode: "number" }).notNull(),
    wins: bigint("wins", { mode: "number" }).notNull(),
    losses: bigint("losses", { mode: "number" }).notNull(),
    kos: bigint("kos", { mode: "number" }).notNull(),
    damageDealt: bigint("damage_dealt", { mode: "number" }).notNull(),
    timeHeld: bigint("time_held", { mode: "number" }).notNull(),
    xp: bigint("xp", { mode: "number" }).notNull(),
  },
  (table) => [
    // Index for querying a player's weapon history
    index("idx_brawlhalla_player_weapon_history_recorded").on(
      table.playerId,
      table.weaponName,
      table.recordedAt,
    ),
    // Indexes for ranking queries per weapon
    index("idx_brawlhalla_player_weapon_history_wins").on(
      table.weaponName,
      table.wins,
    ),
    index("idx_brawlhalla_player_weapon_history_games").on(
      table.weaponName,
      table.games,
    ),
    index("idx_brawlhalla_player_weapon_history_losses").on(
      table.weaponName,
      table.losses,
    ),
    index("idx_brawlhalla_player_weapon_history_kos").on(
      table.weaponName,
      table.kos,
    ),
    // Index for player's best weapons
    index("idx_brawlhalla_player_weapon_history_player_wins").on(
      table.playerId,
      table.wins,
    ),
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
