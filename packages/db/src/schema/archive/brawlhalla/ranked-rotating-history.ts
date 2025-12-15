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
 * Ranked rotating history table storing snapshots from the rotating leaderboard.
 * Used to track active players in the rotating ranked queue.
 */
export const rankedRotatingHistoryTable = pgTable(
  "brawlhalla_ranked_rotating_history",
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
  },
  (table) => [
    // Index for finding players with recent activity
    index("idx_ranked_rotating_history_recorded_at").on(table.recordedAt),
    // Index for looking up a specific player's history
    index("idx_ranked_rotating_history_player_recorded").on(
      table.playerId,
      table.recordedAt,
    ),
    // Index for sorting by rating
    index("idx_ranked_rotating_history_rating").on(table.rating),
    // Index for region filtering
    index("idx_ranked_rotating_history_region").on(table.region),
  ],
)

export type RankedRotatingHistory =
  typeof rankedRotatingHistoryTable.$inferSelect
export type NewRankedRotatingHistory =
  typeof rankedRotatingHistoryTable.$inferInsert
