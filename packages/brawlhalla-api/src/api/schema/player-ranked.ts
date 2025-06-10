import { z } from "zod"

import { rankedRegionSchema } from "../../constants/ranked/regions"
import { rankedTierSchema } from "../../constants/ranked/tiers"
import { brawlhallaIdSchema, brawlhallaNameSchema } from "./brawlhalla-id"

const legendSchema = z.strictObject({
	legend_id: z.number(),
	legend_name_key: z.string(),
	rating: z.number(),
	peak_rating: z.number(),
	tier: rankedTierSchema,
	wins: z.number(),
	games: z.number(),
})

const ranked2v2Schema = z.strictObject({
	brawlhalla_id_one: brawlhallaIdSchema,
	brawlhalla_id_two: brawlhallaIdSchema,
	rating: z.number(),
	peak_rating: z.number(),
	tier: rankedTierSchema.nullable(),
	wins: z.number(),
	games: z.number(),
	teamname: brawlhallaNameSchema,
	region: z.number(),
	global_rank: z.number(),
})

export const playerRankedSchema = z.strictObject({
	name: brawlhallaNameSchema,
	brawlhalla_id: brawlhallaIdSchema,
	global_rank: z.number(),
	region_rank: z.number(),
	legends: z.array(legendSchema),
	"2v2": z.array(ranked2v2Schema),
	rating: z.number(),
	peak_rating: z.number(),
	tier: rankedTierSchema.nullable(), // 'Valhallan' tier is null
	wins: z.number(),
	games: z.number(),
	region: rankedRegionSchema,
	rotating_ranked: z.union([
		z.array(z.never()),
		z.strictObject({
			name: brawlhallaNameSchema,
			brawlhalla_id: z.number(),
			rating: z.number(),
			peak_rating: z.number(),
			tier: rankedTierSchema,
			wins: z.number(),
			games: z.number(),
			region: rankedRegionSchema,
		}),
	]),
})

export type PlayerRanked = z.infer<typeof playerRankedSchema>
