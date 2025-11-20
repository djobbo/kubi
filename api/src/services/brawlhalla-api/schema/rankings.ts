import { Schema } from "effect"
import { BrawlhallaApiRegion } from "./region"
import { BrawlhallaApiTier } from "./tier"

const Ranking = Schema.Struct({
  rank: Schema.Number,
  rating: Schema.Number,
  tier: BrawlhallaApiTier,
  games: Schema.Number,
  wins: Schema.Number,
  region: BrawlhallaApiRegion,
  peak_rating: Schema.Number,
})

export const BrawlhallaApiRanking1v1 = Schema.Struct({
  ...Ranking.fields,
  name: Schema.String,
  brawlhalla_id: Schema.Number,
  best_legend: Schema.Number,
  best_legend_games: Schema.Number,
  best_legend_wins: Schema.Number,
})

export const BrawlhallaApiRankings1v1 = Schema.Array(BrawlhallaApiRanking1v1)

export const BrawlhallaApiRanking2v2 = Schema.Struct({
  ...Ranking.fields,
  teamname: Schema.String,
  brawlhalla_id_one: Schema.Number,
  brawlhalla_id_two: Schema.Number,
})

export const BrawlhallaApiRankings2v2 = Schema.Array(BrawlhallaApiRanking2v2)
