import { sql } from "drizzle-orm"
import {
  bigint,
  index,
  integer,
  jsonb,
  pgTable,
  uuid,
  text,
} from "drizzle-orm/pg-core"
import { withRecordedAt } from "../../../helpers/with-timestamp"
import { relations } from "drizzle-orm"
import { playerLegendHistoryTable } from "./player-legend-history"
import { playerWeaponHistoryTable } from "./player-weapon-history"

/**
 * Player history table storing historical player data from Brawlhalla API.
 * Uses hybrid approach: frequently queried fields as columns, rest in JSONB.
 */
export const playerHistoryTable = pgTable(
  "brawlhalla_player_history",
  {
    id: uuid("id").primaryKey().default(sql`uuidv7()`).primaryKey(),

    playerId: bigint("player_id", { mode: "number" }).notNull(),
    ...withRecordedAt,

    // Extracted columns: fields used for ranking/filtering
    name: text("name").notNull(),
    xp: bigint("xp", { mode: "number" }).notNull(),
    games: bigint("games", { mode: "number" }).notNull(),
    wins: bigint("wins", { mode: "number" }).notNull(),
    losses: bigint("losses", { mode: "number" }).notNull(),
    matchtime: bigint("matchtime", { mode: "number" }).notNull(),
    kos: bigint("kos", { mode: "number" }).notNull(),
    falls: bigint("falls", { mode: "number" }).notNull(),
    suicides: bigint("suicides", { mode: "number" }).notNull(),
    teamKos: bigint("team_kos", { mode: "number" }).notNull(),
    damageDealt: bigint("damage_dealt", { mode: "number" }).notNull(),
    damageTaken: bigint("damage_taken", { mode: "number" }).notNull(),

    // Ranked fields
    rankedGames: integer("ranked_games"),
    rankedWins: integer("ranked_wins"),
    rankedLosses: integer("ranked_losses"),
    totalGlory: integer("total_glory"),
    // Ranked 1v1
    ranked1v1Rating: integer("ranked_1v1_rating"),
    ranked1v1PeakRating: integer("ranked_1v1_peak_rating"),
    ranked1v1Games: integer("ranked_1v1_games"),
    ranked1v1Wins: integer("ranked_1v1_wins"),
    ranked1v1Losses: integer("ranked_1v1_losses"),
    // Ranked 2v2
    ranked2v2Games: integer("ranked_2v2_games"),
    ranked2v2Wins: integer("ranked_2v2_wins"),
    ranked2v2Losses: integer("ranked_2v2_losses"),
    // Ranked rotating
    rankedRotatingRating: integer("ranked_rotating_rating"),
    rankedRotatingPeakRating: integer("ranked_rotating_peak_rating"),
    rankedRotatingGames: integer("ranked_rotating_games"),
    rankedRotatingWins: integer("ranked_rotating_wins"),
    rankedRotatingLosses: integer("ranked_rotating_losses"),
    tier: text("tier"),
    region: text("region"),
    clanId: bigint("clan_id", { mode: "number" }),

    // JSONB: everything else from the API response
    rawStatsData: jsonb("raw_stats_data").$type<unknown>(),
    rawRankedData: jsonb("raw_ranked_data").$type<unknown>(),
  },
  (table) => [
    // Index for filtering a single player by id, returning all historical data sorted by date
    index("idx_brawlhalla_player_history_recorded").on(
      table.playerId,
      table.recordedAt,
    ),
    // Indexes for ranking queries
    // Fields for ranking/filtering
    index("idx_brawlhalla_player_history_name").on(table.name),
    index("idx_brawlhalla_player_history_xp").on(table.xp),
    index("idx_brawlhalla_player_history_games").on(table.games),
    index("idx_brawlhalla_player_history_wins").on(table.wins),
    index("idx_brawlhalla_player_history_losses").on(table.losses),
    // Ranked
    index("idx_brawlhalla_player_history_ranked_games").on(table.rankedGames),
    index("idx_brawlhalla_player_history_ranked_wins").on(table.rankedWins),
    index("idx_brawlhalla_player_history_ranked_losses").on(table.rankedLosses),
    index("idx_brawlhalla_player_history_total_glory").on(table.totalGlory),
    // Ranked 1v1
    index("idx_brawlhalla_player_history_ranked_1v1_rating").on(
      table.ranked1v1Rating,
    ),
    index("idx_brawlhalla_player_history_ranked_1v1_peak_rating").on(
      table.ranked1v1PeakRating,
    ),
    index("idx_brawlhalla_player_history_ranked_1v1_games").on(
      table.ranked1v1Games,
    ),
    index("idx_brawlhalla_player_history_ranked_1v1_wins").on(
      table.ranked1v1Wins,
    ),
    index("idx_brawlhalla_player_history_ranked_1v1_losses").on(
      table.ranked1v1Losses,
    ),
    // Ranked 2v2
    index("idx_brawlhalla_player_history_ranked_2v2_games").on(
      table.ranked2v2Games,
    ),
    index("idx_brawlhalla_player_history_ranked_2v2_wins").on(
      table.ranked2v2Wins,
    ),
    index("idx_brawlhalla_player_history_ranked_2v2_losses").on(
      table.ranked2v2Losses,
    ),
    // Ranked rotating
    index("idx_brawlhalla_player_history_ranked_rotating_rating").on(
      table.rankedRotatingRating,
    ),
    index("idx_brawlhalla_player_history_ranked_rotating_peak_rating").on(
      table.rankedRotatingPeakRating,
    ),
    index("idx_brawlhalla_player_history_ranked_rotating_games").on(
      table.rankedRotatingGames,
    ),
    index("idx_brawlhalla_player_history_ranked_rotating_wins").on(
      table.rankedRotatingWins,
    ),
    index("idx_brawlhalla_player_history_ranked_rotating_losses").on(
      table.rankedRotatingLosses,
    ),
    // Clan
    index("idx_brawlhalla_player_history_clan_id").on(table.clanId),
    // Index for latest records (useful for ranking queries)
    index("idx_brawlhalla_player_history_recorded_at").on(table.recordedAt),
  ],
)

export type PlayerHistory = typeof playerHistoryTable.$inferSelect
export type NewPlayerHistory = typeof playerHistoryTable.$inferInsert

export const playerHistoryRelations = relations(
  playerHistoryTable,
  ({ many }) => ({
    legendHistory: many(playerLegendHistoryTable),
    weaponHistory: many(playerWeaponHistoryTable),
  }),
)
