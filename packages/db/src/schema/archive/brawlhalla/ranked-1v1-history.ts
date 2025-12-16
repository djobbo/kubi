import { sql } from "drizzle-orm"
import {
  bigint,
  index,
  integer,
  pgTable,
  uuid,
  text,
} from "drizzle-orm/pg-core"
import { withRecordedAt } from "../../../helpers/with-timestamp"

/**
 * Ranked 1v1 history table storing snapshots from the 1v1 leaderboard.
 * Used to track active players in the ranked queue.
 */
export const ranked1v1HistoryTable = pgTable(
  "brawlhalla_ranked_1v1_history",
  {
    id: uuid("id").primaryKey().default(sql`uuidv7()`),
    ...withRecordedAt,

    // Player identification
    playerId: bigint("player_id", { mode: "number" }).notNull(),
    name: text("name").notNull(),

    // Ranking data
    rank: integer("rank").notNull(),
    rating: integer("rating").notNull(),
    peakRating: integer("peak_rating").notNull(),
    tier: text("tier").notNull(),
    games: integer("games").notNull(),
    wins: integer("wins").notNull(),
    region: text("region").notNull(),

    // Best legend data
    bestLegendId: integer("best_legend_id"),
    bestLegendGames: integer("best_legend_games"),
    bestLegendWins: integer("best_legend_wins"),
  },
  (table) => [
    // Index for finding players with recent activity
    index("idx_ranked_1v1_history_recorded_at").on(table.recordedAt),
    // Index for looking up a specific player's history
    index("idx_ranked_1v1_history_player_recorded").on(
      table.playerId,
      table.recordedAt,
    ),
    // Index for sorting by rating
    index("idx_ranked_1v1_history_rating").on(table.rating),
    // Index for region filtering
    index("idx_ranked_1v1_history_region").on(table.region),
  ],
)

export type Ranked1v1History = typeof ranked1v1HistoryTable.$inferSelect
export type NewRanked1v1History = typeof ranked1v1HistoryTable.$inferInsert
