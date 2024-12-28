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

export const rankedRegionSchema = z.enum(rankedRegions).catch("all")

export type RankedRegion = (typeof rankedRegions)[number]
