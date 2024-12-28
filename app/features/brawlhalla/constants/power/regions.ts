import { z } from "zod"

export const powerRankedRegions = ["na", "eu", "sa", "sea", "aus"] as const
const upperCasePowerRankedRegions = powerRankedRegions.map(
  (region) =>
    region.toUpperCase() as Uppercase<(typeof powerRankedRegions)[number]>,
)

export const powerRankedRegionSchema = z
  .enum([...powerRankedRegions, ...upperCasePowerRankedRegions])
  .catch("na")

export type PowerRankedRegion = z.infer<typeof powerRankedRegionSchema>
