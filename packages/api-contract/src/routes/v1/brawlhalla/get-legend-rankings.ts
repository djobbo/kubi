import { Schema } from "effect"
import type { PlayerLegendHistory } from "@dair/db"
export const LegendRanking = Schema.Struct({
  legendId: Schema.Number,
  playerId: Schema.Number,
  playerName: Schema.String,
  playerSlug: Schema.String,
  xp: Schema.Number,
  games: Schema.Number,
  wins: Schema.Number,
  losses: Schema.Number,
  matchtime: Schema.Number,
  kos: Schema.Number,
  falls: Schema.Number,
  suicides: Schema.Number,
  teamKos: Schema.Number,
  damageDealt: Schema.Number,
  damageTaken: Schema.Number,
})

export const GlobalLegendRankingsOrderBy = Schema.Literals([
  "xp",
  "games",
  "wins",
  "losses",
  "matchtime",
  "kos",
  "falls",
  "suicides",
  "teamKos",
  "damageDealt",
  "damageTaken",
] as const satisfies readonly (keyof PlayerLegendHistory)[])

null as unknown as PlayerLegendHistory satisfies Omit<
  typeof LegendRanking.Type,
  "playerSlug" | "playerName"
>

export const GetGlobalLegendRankingsResponse = Schema.Struct({
  data: Schema.Array(LegendRanking),
  meta: Schema.Struct({}),
})
