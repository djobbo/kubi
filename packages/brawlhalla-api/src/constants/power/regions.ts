import { z } from "zod"

export enum PowerRankingsRegion {
	NA = "NA",
	EU = "EU",
	SA = "SA",
	SEA = "SEA",
}

export const powerRankedRegions = [
	PowerRankingsRegion.NA,
	PowerRankingsRegion.EU,
	PowerRankingsRegion.SA,
	PowerRankingsRegion.SEA,
] as const
const lowerCasePowerRankedRegions = powerRankedRegions.map(
	(region) =>
		region.toLowerCase() as Lowercase<(typeof powerRankedRegions)[number]>,
)

export const powerRankedRegionSchema = z
	.enum([...powerRankedRegions, ...lowerCasePowerRankedRegions])
	.default(PowerRankingsRegion.NA)
	.catch(PowerRankingsRegion.NA)

export type PowerRankedRegion = z.infer<typeof powerRankedRegionSchema>
