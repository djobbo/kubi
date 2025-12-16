import { regions } from "@dair/api-contract/src/shared/region"

/**
 * Ranking types supported by the Brawlhalla API
 */
export type RankingType = "1v1" | "2v2" | "rotating"

/**
 * All ranking types in order
 */
export const rankingTypes: RankingType[] = ["1v1", "2v2", "rotating"]

/**
 * Page counts per region - more pages for larger regions
 */
export const regionPageCounts: Record<(typeof regions)[number], number> = {
  eu: 5,
  "us-e": 5,
  sa: 5,
  sea: 3,
  brz: 3,
  aus: 3,
  "us-w": 3,
  jpn: 3,
  me: 3,
}

/**
 * A crawl task representing a single rankings page to fetch
 */
export type CrawlTask = {
  region: (typeof regions)[number]
  page: number
  type: RankingType
}

export type CrawlTaskGeneratorOptions = {
  /** Which ranking types to include (default: all) */
  types?: RankingType[]
  /** Override page counts per region */
  pageCounts?: Partial<Record<(typeof regions)[number], number>>
  /** Which regions to include (default: all) */
  regions?: (typeof regions)[number][]
}

/**
 * Generate crawl tasks for rankings pages
 */
export const generateCrawlTasks = (
  options: CrawlTaskGeneratorOptions = {},
): CrawlTask[] => {
  const {
    types = rankingTypes,
    pageCounts = {},
    regions: selectedRegions = [...regions],
  } = options

  const tasks: CrawlTask[] = []
  const mergedPageCounts = { ...regionPageCounts, ...pageCounts }

  for (const region of selectedRegions) {
    const pageCount = mergedPageCounts[region]
    for (let page = 1; page <= pageCount; page++) {
      for (const type of types) {
        tasks.push({ region, page, type })
      }
    }
  }

  return tasks
}

/**
 * Format a crawl task for logging
 */
export const formatCrawlTask = (task: CrawlTask): string =>
  `${task.type} rankings for ${task.region} page ${task.page}`
