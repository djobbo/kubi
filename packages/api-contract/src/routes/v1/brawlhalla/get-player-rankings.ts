import { Schema } from "effect"
import type { PlayerHistory } from "@dair/db"
export const PlayerRanking = Schema.Struct({
  playerId: Schema.Number,
  name: Schema.String,
  slug: Schema.String,
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
  rankedGames: Schema.NullOr(Schema.Number),
  rankedWins: Schema.NullOr(Schema.Number),
  rankedLosses: Schema.NullOr(Schema.Number),
  totalGlory: Schema.NullOr(Schema.Number),
  ranked1v1Rating: Schema.NullOr(Schema.Number),
  ranked1v1PeakRating: Schema.NullOr(Schema.Number),
  ranked1v1Games: Schema.NullOr(Schema.Number),
  ranked1v1Wins: Schema.NullOr(Schema.Number),
  ranked1v1Losses: Schema.NullOr(Schema.Number),
  ranked2v2Games: Schema.NullOr(Schema.Number),
  ranked2v2Wins: Schema.NullOr(Schema.Number),
  ranked2v2Losses: Schema.NullOr(Schema.Number),
  rankedRotatingRating: Schema.NullOr(Schema.Number),
  rankedRotatingPeakRating: Schema.NullOr(Schema.Number),
  rankedRotatingGames: Schema.NullOr(Schema.Number),
  rankedRotatingWins: Schema.NullOr(Schema.Number),
  rankedRotatingLosses: Schema.NullOr(Schema.Number),
})

export const GlobalPlayerRankingsOrderBy = Schema.Literals([
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
] as const satisfies readonly (keyof PlayerHistory)[])

null as unknown as PlayerHistory satisfies Omit<
  typeof PlayerRanking.Type,
  "slug"
>

export const GetGlobalPlayerRankingsResponse = Schema.Struct({
  data: Schema.Array(PlayerRanking),
  meta: Schema.Struct({}),
})
