import {
  rankedRegions,
  type RankedRegion,
} from "@dair/brawlhalla-api/src/constants/ranked/regions"

export const RANKINGS_BRACKETS = [
  { page: "1v1", label: "1v1" },
  { page: "2v2", label: "2v2" },
] as const

export type RankingsBracket = (typeof RANKINGS_BRACKETS)[number]["page"]

export const RANKINGS_REGIONS: ReadonlyArray<{
  page: RankedRegion
  label: string
}> = [
  { page: "all", label: "Global" },
  { page: "us-e", label: "US-E" },
  { page: "eu", label: "EU" },
  { page: "sea", label: "SEA" },
  { page: "brz", label: "BRZ" },
  { page: "aus", label: "AUS" },
  { page: "us-w", label: "US-W" },
  { page: "jpn", label: "JPN" },
  { page: "sa", label: "SA" },
  { page: "me", label: "ME" },
] as const

export const isRankingsBracket = (value: string): value is RankingsBracket =>
  RANKINGS_BRACKETS.some((bracket) => bracket.page === value)

export const isRankingsRegion = (value: string): value is RankedRegion =>
  rankedRegions.includes(value as RankedRegion)

export const parseRankingsPage = (value: string | undefined): number => {
  const page = Number.parseInt(value ?? "1", 10)
  return Number.isFinite(page) && page >= 1 ? page : 1
}
