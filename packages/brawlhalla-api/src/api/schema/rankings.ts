import { z } from "zod"

import { rankedRegionSchema } from "../../constants/ranked/regions"
import { rankedTierSchema } from "../../constants/ranked/tiers"
import { brawlhallaNameSchema } from "./brawlhalla-id"

const rankingSchema = z.strictObject({
	rank: z.number(),
	rating: z.number(),
	tier: rankedTierSchema,
	games: z.number(),
	wins: z.number(),
	region: rankedRegionSchema,
	peak_rating: z.number(),
})

export const ranking1v1Schema = rankingSchema.extend({
	name: brawlhallaNameSchema,
	brawlhalla_id: z.number(),
	best_legend: z.number(),
	best_legend_games: z.number(),
	best_legend_wins: z.number(),
	twitch_name: z.string().optional(),
})

export const ranking2v2Schema = rankingSchema.extend({
	teamname: brawlhallaNameSchema,
	brawlhalla_id_one: z.number(),
	brawlhalla_id_two: z.number(),
	twitch_name_one: z.string().optional(),
	twitch_name_two: z.string().optional(),
})

export type Ranking = z.infer<typeof rankingSchema>
export type Ranking1v1 = z.infer<typeof ranking1v1Schema>
export type Ranking2v2 = z.infer<typeof ranking2v2Schema>
