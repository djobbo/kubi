import { z } from "zod"

export const powerRankedRegions = ["na", "eu", "sa", "sea", "aus"] as const

export const powerRankedRegionSchema = z.enum(powerRankedRegions).catch("na")

export type PowerRankedRegion = (typeof powerRankedRegions)[number]
