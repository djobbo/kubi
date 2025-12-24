import { Schema } from "effect"

export const PowerRankingsGameMode = Schema.Literal("1v1", "2v2")
export type PowerRankingsGameMode = typeof PowerRankingsGameMode.Type

export const PowerRankingsRegion = Schema.Literal(
  "NA",
  "EU",
  "SA",
  "SEA",
  "MENA",
  "LAN",
)
export type PowerRankingsRegion = typeof PowerRankingsRegion.Type

export const PowerRankingsOrderBy = Schema.Literal(
  "top8",
  "top32",
  "gold",
  "silver",
  "bronze",
  "powerRanking",
  "points",
  "earnings",
)
export type PowerRankingsOrderBy = typeof PowerRankingsOrderBy.Type

export const PowerRankingsOrder = Schema.Literal("ASC", "DESC")
export type PowerRankingsOrder = typeof PowerRankingsOrder.Type

export const PowerRankingsPlayer = Schema.Struct({
  playerId: Schema.Number,
  playerName: Schema.String,
  twitter: Schema.optional(Schema.String),
  twitch: Schema.optional(Schema.String),
  top8: Schema.Number,
  top32: Schema.Number,
  gold: Schema.Number,
  silver: Schema.Number,
  bronze: Schema.Number,
  powerRanking: Schema.Number,
  points: Schema.Number,
  earnings: Schema.Number,
})

export const GetPowerRankingsResponse = Schema.Struct({
  data: Schema.Array(PowerRankingsPlayer),
  meta: Schema.Struct({
    page: Schema.Number,
    totalPages: Schema.Number,
    region: PowerRankingsRegion,
    gameMode: Schema.String,
    orderBy: Schema.String,
    order: Schema.String,
    lastUpdated: Schema.String,
    timestamp: Schema.Date,
  }),
})
