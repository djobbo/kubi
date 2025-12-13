import { relations, sql } from "drizzle-orm"
import {
  bigint,
  index,
  jsonb,
  pgTable,
  uuid,
  text,
  timestamp,
} from "drizzle-orm/pg-core"
import { playerLegendHistoryTable } from "./player-legend-history"
import { playerWeaponHistoryTable } from "./player-weapon-history"

/**
 * Player history table storing historical player data from Brawlhalla API.
 * Uses hybrid approach: frequently queried fields as columns, rest in JSONB.
 */
export const playerHistoryTable = pgTable(
  "player_history",
  {
    id: uuid("id").primaryKey().default(sql`uuidv7()`).primaryKey(),

    playerId: bigint("player_id", { mode: "number" }).notNull(),
    recordedAt: timestamp("recorded_at", { withTimezone: true }).notNull(),

    // Extracted columns: fields used for ranking/filtering
    // From PlayerStats (packages/api-contract)
    name: text("name"),
    xp: bigint("xp", { mode: "number" }),
    level: bigint("level", { mode: "number" }),
    xpPercentage: bigint("xp_percentage", { mode: "number" }),
    games: bigint("games", { mode: "number" }),
    wins: bigint("wins", { mode: "number" }),
    matchtime: bigint("matchtime", { mode: "number" }),
    kos: bigint("kos", { mode: "number" }),
    falls: bigint("falls", { mode: "number" }),
    suicides: bigint("suicides", { mode: "number" }),
    teamKos: bigint("team_kos", { mode: "number" }),
    damageDealt: bigint("damage_dealt", { mode: "number" }),
    damageTaken: bigint("damage_taken", { mode: "number" }),
    // Computed winrate: (wins / games) * 100
    winrate: bigint("winrate", { mode: "number" }),

    // Ranked fields (from PlayerRanked.stats and PlayerRanked.1v1)
    // From PlayerRanked.stats
    rankedGames: bigint("ranked_games", { mode: "number" }),
    rankedWins: bigint("ranked_wins", { mode: "number" }),
    rankedLosses: bigint("ranked_losses", { mode: "number" }),
    gloryFromWins: bigint("glory_from_wins", { mode: "number" }),
    gloryFromPeakRating: bigint("glory_from_peak_rating", { mode: "number" }),
    totalGlory: bigint("total_glory", { mode: "number" }),
    // From PlayerRanked.1v1
    ranked1v1Rating: bigint("ranked_1v1_rating", { mode: "number" }),
    ranked1v1PeakRating: bigint("ranked_1v1_peak_rating", { mode: "number" }),
    ranked1v1Games: bigint("ranked_1v1_games", { mode: "number" }),
    ranked1v1Wins: bigint("ranked_1v1_wins", { mode: "number" }),
    ranked1v1Losses: bigint("ranked_1v1_losses", { mode: "number" }),
    // From PlayerRanked.2v2
    ranked2v2Games: bigint("ranked_2v2_games", { mode: "number" }),
    ranked2v2Wins: bigint("ranked_2v2_wins", { mode: "number" }),
    ranked2v2Losses: bigint("ranked_2v2_losses", { mode: "number" }),
    // From PlayerRanked.rotating
    rankedRotatingRating: bigint("ranked_rotating_rating", { mode: "number" }),
    rankedRotatingPeakRating: bigint("ranked_rotating_peak_rating", {
      mode: "number",
    }),
    rankedRotatingGames: bigint("ranked_rotating_games", { mode: "number" }),
    rankedRotatingWins: bigint("ranked_rotating_wins", { mode: "number" }),
    rankedRotatingLosses: bigint("ranked_rotating_losses", { mode: "number" }),
    tier: text("tier"),
    region: text("region"),
    ratingReset: bigint("rating_reset", { mode: "number" }),
    clanId: bigint("clan_id", { mode: "number" }),

    // JSONB: everything else from the API response
    rawData: jsonb("raw_data").$type<unknown>(),
  },
  (table) => [
    // Index for filtering a single player by id, returning all historical data sorted by date
    index("idx_player_recorded").on(table.playerId, table.recordedAt),
    // Indexes for ranking queries
    index("idx_rating_1v1").on(table.ranked1v1Rating),
    index("idx_peak_rating_1v1").on(table.ranked1v1PeakRating),
    index("idx_games_1v1").on(table.ranked1v1Games),
    index("idx_wins_1v1").on(table.ranked1v1Wins),
    index("idx_losses_1v1").on(table.ranked1v1Losses),
    index("idx_glory_from_wins_1v1").on(table.gloryFromWins),
    index("idx_glory_from_peak_rating_1v1").on(table.gloryFromPeakRating),
    index("idx_total_glory_1v1").on(table.totalGlory),
    index("idx_games_2v2").on(table.ranked2v2Games),
    index("idx_rating_rotating").on(table.rankedRotatingRating),
    index("idx_peak_rating_rotating").on(table.rankedRotatingPeakRating),
    index("idx_xp").on(table.xp),
    index("idx_level").on(table.level),
    index("idx_wins").on(table.wins),
    index("idx_games").on(table.games),
    index("idx_winrate").on(table.winrate),
    index("idx_name").on(table.name),
    // Index for latest records (useful for ranking queries)
    index("idx_recorded_at").on(table.recordedAt),
  ],
)

export type PlayerHistory = typeof playerHistoryTable.$inferSelect
export type NewPlayerHistory = typeof playerHistoryTable.$inferInsert
