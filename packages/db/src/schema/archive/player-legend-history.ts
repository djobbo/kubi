import { relations, sql } from "drizzle-orm"
import {
  bigint,
  index,
  pgTable,
  uuid,
  text,
  timestamp,
} from "drizzle-orm/pg-core"
import { withTimestamp } from "../../helpers/with-timestamp"
import { playerHistoryTable } from "./player-history"

/**
 * Player legend history table storing historical legend-specific stats per player.
 * Extracted from the legends array in Brawlhalla API responses.
 */
export const playerLegendHistoryTable = pgTable(
  "player_legend_history",
  {
    id: uuid("id").primaryKey().default(sql`uuidv7()`).primaryKey(),

    playerHistoryId: uuid("player_history_id")
      .notNull()
      .references(() => playerHistoryTable.id, { onDelete: "cascade" }),
    playerId: bigint("player_id", { mode: "number" }).notNull(),
    recordedAt: timestamp("recorded_at", { withTimezone: true }).notNull(),

    // Legend identification
    legendId: bigint("legend_id", { mode: "number" }).notNull(),
    legendNameKey: text("legend_name_key"),

    // Extracted columns: frequently queried fields
    // From PlayerLegend.stats (packages/api-contract)
    legendName: text("legend_name"), // bio_name from legends data
    games: bigint("games", { mode: "number" }),
    wins: bigint("wins", { mode: "number" }),
    xp: bigint("xp", { mode: "number" }),
    level: bigint("level", { mode: "number" }),
    xpPercentage: bigint("xp_percentage", { mode: "number" }),
    damageDealt: bigint("damage_dealt", { mode: "number" }),
    damageTaken: bigint("damage_taken", { mode: "number" }),
    kos: bigint("kos", { mode: "number" }),
    falls: bigint("falls", { mode: "number" }),
    suicides: bigint("suicides", { mode: "number" }),
    teamKos: bigint("team_kos", { mode: "number" }),
    matchtime: bigint("matchtime", { mode: "number" }),
    // Computed winrate: (wins / games) * 100
    winrate: bigint("winrate", { mode: "number" }),

    // From PlayerLegend.ranked
    rating: bigint("rating", { mode: "number" }),
    peakRating: bigint("peak_rating", { mode: "number" }),
    tier: text("tier"),
    ...withTimestamp,
  },
  (table) => [
    // Index for querying a player's legend history
    index("idx_player_legend_recorded").on(
      table.playerId,
      table.legendId,
      table.recordedAt,
    ),
    // Indexes for ranking queries per legend
    index("idx_legend_wins").on(table.legendId, table.wins),
    index("idx_legend_games").on(table.legendId, table.games),
    index("idx_legend_rating").on(table.legendId, table.rating),
    index("idx_legend_kos").on(table.legendId, table.kos),
    index("idx_legend_winrate").on(table.legendId, table.winrate),
    // Index for player's best legends
    index("idx_player_wins").on(table.playerId, table.wins),
  ],
)

export type PlayerLegendHistory = typeof playerLegendHistoryTable.$inferSelect
export type NewPlayerLegendHistory =
  typeof playerLegendHistoryTable.$inferInsert

export const playerLegendHistoryRelations = relations(
  playerLegendHistoryTable,
  ({ one }) => ({
    playerHistory: one(playerHistoryTable, {
      fields: [playerLegendHistoryTable.playerHistoryId],
      references: [playerHistoryTable.id],
    }),
  }),
)
