import { z } from "zod"

import { rankedTierSchema } from "../../constants/ranked/tiers"
import { brawlhallaIdSchema } from "./brawlhalla-id"

const legendSchema = z.strictObject({
  legend_id: z.number(),
  legend_name_key: z.string(),
  rating: z.number(),
  peak_rating: z.number(),
  tier: z.string().nullable(), // 'Valhallan' tier is null
  wins: z.number(),
  games: z.number(),
})

const ranked2v2Schema = z.strictObject({
  brawlhalla_id_one: brawlhallaIdSchema,
  brawlhalla_id_two: brawlhallaIdSchema,
  rating: z.number(),
  peak_rating: z.number(),
  tier: rankedTierSchema,
  wins: z.number(),
  games: z.number(),
  teamname: z.string(),
  region: z.number(),
  global_rank: z.number(),
})

export const playerRankedSchema = z.strictObject({
  name: z.string(),
  brawlhalla_id: brawlhallaIdSchema,
  global_rank: z.number(),
  region_rank: z.number(),
  legends: z.array(legendSchema),
  "2v2": z.array(ranked2v2Schema),
  rating: z.number(),
  peak_rating: z.number(),
  tier: rankedTierSchema,
  wins: z.number(),
  games: z.number(),
  region: z.string(),
  rotating_ranked: z.strictObject({
    season: z.number(),
    queue: z.string(),
    season_end: z.string(),
  }),
})

export type PlayerRanked = z.infer<typeof playerRankedSchema>
