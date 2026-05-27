import { Schema } from "effect"
import {
  PowerRankingsGameModeSchema,
  PowerRankingsOrderBySchema,
  PowerRankingsPlayer,
  PowerRankingsRegionSchema,
  powerRankingsOrders,
  type PowerRankingsGameMode as PowerRankingsGameModeType,
  type PowerRankingsOrderBy as PowerRankingsOrderByType,
  type PowerRankingsRegion as PowerRankingsRegionType,
} from "@dair/brawltools-api"

export const PowerRankingsGameMode = PowerRankingsGameModeSchema
export const PowerRankingsRegion = PowerRankingsRegionSchema
export const PowerRankingsOrderBy = PowerRankingsOrderBySchema
export { PowerRankingsPlayer }

export type PowerRankingsGameMode = PowerRankingsGameModeType
export type PowerRankingsRegion = PowerRankingsRegionType
export type PowerRankingsOrderBy = PowerRankingsOrderByType

export const PowerRankingsOrder = Schema.Literals(powerRankingsOrders)
export type PowerRankingsOrder = typeof PowerRankingsOrder.Type

export const GetPowerRankingsResponse = Schema.Struct({
  data: Schema.Array(PowerRankingsPlayer),
  meta: Schema.Struct({
    page: Schema.Number,
    totalPages: Schema.Number,
    region: PowerRankingsRegionSchema,
    gameMode: Schema.String,
    orderBy: Schema.String,
    order: Schema.String,
    lastUpdated: Schema.String,
    timestamp: Schema.Date,
  }),
})
