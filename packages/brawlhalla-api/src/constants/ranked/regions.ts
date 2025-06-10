import { z } from "zod"

export const rankedRegions = [
	"all",
	"us-e",
	"eu",
	"sea",
	"brz",
	"aus",
	"us-w",
	"jpn",
	"sa",
	"me",
] as const
const upperCaseRankedRegions = rankedRegions.map(
	(region) => region.toUpperCase() as Uppercase<(typeof rankedRegions)[number]>,
)

export const rankedRegionSchema = z
	.enum([...rankedRegions, ...upperCaseRankedRegions])
	.catch("all")

export type RankedRegion = z.infer<typeof rankedRegionSchema>
