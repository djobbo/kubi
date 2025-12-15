import { CleanString } from "@/helpers/clean-string"
import { NumberFromString } from "@/helpers/number-from-string"
import { ParseResult, Schema } from "effect"
import { BrawlhallaApiRegion } from "./region"
import { BrawlhallaApiTier } from "./tier"

const Legend = Schema.Struct({
  legend_id: Schema.Number,
  legend_name_key: Schema.String,
  rating: Schema.Number,
  peak_rating: Schema.Number,
  tier: BrawlhallaApiTier,
  wins: Schema.Number,
  games: Schema.Number,
})

const Ranked2v2Team = Schema.Struct({
  brawlhalla_id_one: NumberFromString,
  brawlhalla_id_two: NumberFromString,
  rating: Schema.Number,
  peak_rating: Schema.Number,
  tier: BrawlhallaApiTier,
  wins: Schema.Number,
  games: Schema.Number,
  teamname: CleanString,
  region: Schema.Number,
  global_rank: Schema.Number,
})

const RotatingRanked = Schema.Struct({
  name: CleanString,
  brawlhalla_id: NumberFromString,
  rating: Schema.Number,
  peak_rating: Schema.Number,
  tier: BrawlhallaApiTier,
  wins: Schema.Number,
  games: Schema.Number,
  region: BrawlhallaApiRegion,
})

const ApiRotatingRanked = Schema.transform(
  Schema.Union(Schema.Array(Schema.Unknown), Schema.NullOr(RotatingRanked)),
  Schema.NullOr(RotatingRanked),
  {
    strict: true,
    decode: (input) => {
      if (!input) return null

      if (Array.isArray(input)) {
        return null
      }

      return input
    },
    encode: (input) => input,
  },
)

export const BrawlhallaApiPlayerRanked = Schema.Struct({
  name: CleanString,
  brawlhalla_id: NumberFromString,
  global_rank: Schema.Number,
  region_rank: Schema.Number,
  legends: Schema.Array(Legend),
  "2v2": Schema.Array(Ranked2v2Team),
  rating: Schema.Number,
  peak_rating: Schema.Number,
  tier: BrawlhallaApiTier,
  wins: Schema.Number,
  games: Schema.Number,
  region: BrawlhallaApiRegion,
  rotating_ranked: ApiRotatingRanked,
})

export type BrawlhallaApiPlayerRanked = Schema.Schema.Type<
  typeof BrawlhallaApiPlayerRanked
>
