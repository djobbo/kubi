import { relations, sql } from "drizzle-orm"
import { bigint, index, pgTable, text, uuid } from "drizzle-orm/pg-core"
import { playerHistoryTable } from "./player-history"
import { withRecordedAt } from "../../../helpers/with-timestamp"

/**
 * Player legend history table storing historical legend-specific stats per player.
 * Extracted from the legends array in Brawlhalla API responses.
 */
export const playerLegendHistoryTable = pgTable(
  "brawlhalla_player_legend_history",
  {
    id: uuid("id").primaryKey().default(sql`uuidv7()`).primaryKey(),

    playerHistoryId: uuid("player_history_id")
      .notNull()
      .references(() => playerHistoryTable.id, { onDelete: "cascade" }),
    playerId: bigint("player_id", { mode: "number" }).notNull(),
    playerName: text("player_name").notNull(),
    ...withRecordedAt,

    // Legend identification
    legendId: bigint("legend_id", { mode: "number" }).notNull(),

    // Extracted columns: frequently queried fields
    games: bigint("games", { mode: "number" }).notNull(),
    wins: bigint("wins", { mode: "number" }).notNull(),
    losses: bigint("losses", { mode: "number" }).notNull(),
    xp: bigint("xp", { mode: "number" }).notNull(),
    damageDealt: bigint("damage_dealt", { mode: "number" }).notNull(),
    damageTaken: bigint("damage_taken", { mode: "number" }).notNull(),
    kos: bigint("kos", { mode: "number" }).notNull(),
    falls: bigint("falls", { mode: "number" }).notNull(),
    suicides: bigint("suicides", { mode: "number" }).notNull(),
    teamKos: bigint("team_kos", { mode: "number" }).notNull(),
    matchtime: bigint("matchtime", { mode: "number" }).notNull(),

    // From PlayerLegend.ranked
    rating: bigint("rating", { mode: "number" }),
    peakRating: bigint("peak_rating", { mode: "number" }),
  },
  (table) => [
    // Index for querying a player's legend history
    index("idx_brawlhalla_player_legend_history_recorded").on(
      table.playerId,
      table.legendId,
      table.recordedAt,
    ),
    // Indexes for ranking queries per legend
    index("idx_brawlhalla_player_legend_history_wins").on(
      table.legendId,
      table.wins,
    ),
    index("idx_brawlhalla_player_legend_history_games").on(
      table.legendId,
      table.games,
    ),
    index("idx_brawlhalla_player_legend_history_rating").on(
      table.legendId,
      table.rating,
    ),
    index("idx_brawlhalla_player_legend_history_losses").on(
      table.legendId,
      table.losses,
    ),
    index("idx_brawlhalla_player_legend_history_kos").on(
      table.legendId,
      table.kos,
    ),
    index("idx_brawlhalla_player_legend_history_player_wins").on(
      table.playerId,
      table.wins,
    ),
    index("idx_brawlhalla_player_legend_history_xp").on(
      table.playerHistoryId,
      table.xp,
    ),
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
