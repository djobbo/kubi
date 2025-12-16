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
 * Ranked 2v2 history table storing snapshots from the 2v2 leaderboard.
 * Used to track active teams in the ranked queue.
 */
export const ranked2v2HistoryTable = pgTable(
  "brawlhalla_ranked_2v2_history",
  {
    id: uuid("id").primaryKey().default(sql`uuidv7()`),
    ...withRecordedAt,

    // Team identification (both players)
    playerIdOne: bigint("player_id_one", { mode: "number" }).notNull(),
    playerIdTwo: bigint("player_id_two", { mode: "number" }).notNull(),
    playerNameOne: text("player_name_one").notNull(),
    playerNameTwo: text("player_name_two").notNull(),

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
    // Index for finding teams with recent activity
    index("idx_ranked_2v2_history_recorded_at").on(table.recordedAt),
    // Index for looking up a specific player's team history
    index("idx_ranked_2v2_history_player_one_recorded").on(
      table.playerIdOne,
      table.recordedAt,
    ),
    index("idx_ranked_2v2_history_player_two_recorded").on(
      table.playerIdTwo,
      table.recordedAt,
    ),
    // Index for sorting by rating
    index("idx_ranked_2v2_history_rating").on(table.rating),
    // Index for region filtering
    index("idx_ranked_2v2_history_region").on(table.region),
  ],
)

export type Ranked2v2History = typeof ranked2v2HistoryTable.$inferSelect
export type NewRanked2v2History = typeof ranked2v2HistoryTable.$inferInsert
