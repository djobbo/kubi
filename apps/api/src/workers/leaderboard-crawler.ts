import { BrawlhallaApi } from "@/services/brawlhalla-api"
import { Archive } from "@/services/archive"
import { Effect } from "effect"
import type {
  NewRanked1v1History,
  NewRanked2v2History,
  NewRankedRotatingHistory,
} from "@dair/db"
import {
  type CrawlTask,
  generateCrawlTasks,
  formatCrawlTask,
} from "./shared/crawl-config"
import { rateLimitRetrySchedule } from "./shared/rate-limit"
import { createScheduledCrawler, schedulePresets } from "./shared/scheduler"
import { getTeamPlayers } from "@dair/brawlhalla-api/src/helpers/team-players"

/**
 * Leaderboard crawler worker that crawls 1v1, 2v2, and rotating rankings
 * for all regions and stores snapshots in the dedicated ranked history tables.
 *
 * This is a lightweight crawler that only fetches rankings pages,
 * NOT individual player stats.
 *
 * Uses worker-specific rate limiter (BrawlhallaApi.worker.*) which:
 * - Has its own rate limit pool (70% of capacity reserved for workers)
 * - Does not interfere with frontend rate limits
 */

/**
 * Fetch and store 1v1 rankings page
 */
const fetch1v1Rankings = Effect.fn("fetch1v1Rankings")(function* (
  region: string,
  page: number,
) {
  const brawlhallaApi = yield* BrawlhallaApi
  const archive = yield* Archive

  const rankings = yield* brawlhallaApi.worker.getRankings1v1(region, page)

  const entries: NewRanked1v1History[] = rankings.data.map((r) => ({
    playerId: r.brawlhalla_id,
    name: r.name,
    rank: r.rank,
    rating: r.rating,
    peakRating: r.peak_rating,
    tier: r.tier ?? "Tin 0",
    games: r.games,
    wins: r.wins,
    region: r.region?.toLowerCase() ?? region,
  }))

  yield* archive.addRanked1v1History(entries)

  return entries.length
})

/**
 * Fetch and store 2v2 rankings page
 */
const fetch2v2Rankings = Effect.fn("fetch2v2Rankings")(function* (
  region: string,
  page: number,
) {
  const brawlhallaApi = yield* BrawlhallaApi
  const archive = yield* Archive

  const rankings = yield* brawlhallaApi.worker.getRankings2v2(region, page)

  const entries: NewRanked2v2History[] = rankings.data.map((r) => {
    const [player1, player2] = getTeamPlayers(r)

    return {
      playerIdOne: player1.id,
      playerIdTwo: player2.id,
      playerNameOne: player1.name,
      playerNameTwo: player2.name,
      rank: r.rank,
      rating: r.rating,
      peakRating: r.peak_rating,
      tier: r.tier ?? "Tin 0",
      games: r.games,
      wins: r.wins,
      region: r.region?.toLowerCase() ?? region,
    }
  })

  yield* archive.addRanked2v2History(entries)

  return entries.length
})

/**
 * Fetch and store rotating rankings page
 */
const fetchRotatingRankings = Effect.fn("fetchRotatingRankings")(function* (
  region: string,
  page: number,
) {
  const brawlhallaApi = yield* BrawlhallaApi
  const archive = yield* Archive

  const rankings = yield* brawlhallaApi.worker.getRankingsRotating(region, page)

  const entries: NewRankedRotatingHistory[] = rankings.data.map((r) => ({
    playerId: r.brawlhalla_id,
    name: r.name,
    rank: r.rank,
    rating: r.rating,
    peakRating: r.peak_rating,
    tier: r.tier ?? "Tin 0",
    games: r.games,
    wins: r.wins,
    region: r.region?.toLowerCase() ?? region,
  }))

  yield* archive.addRankedRotatingHistory(entries)

  return entries.length
})

/**
 * Process a single crawl task (fetch rankings for a specific type/region/page)
 * Rate limiting is handled internally by BrawlhallaApi.worker.* methods
 */
const processCrawlTask = (task: CrawlTask) =>
  Effect.gen(function* () {
    yield* Effect.log(`Fetching ${formatCrawlTask(task)}`)

    const fetchFn = (() => {
      switch (task.type) {
        case "1v1":
          return fetch1v1Rankings(task.region, task.page)
        case "2v2":
          return fetch2v2Rankings(task.region, task.page)
        case "rotating":
          return fetchRotatingRankings(task.region, task.page)
      }
    })()

    const count = yield* fetchFn.pipe(
      Effect.retry(rateLimitRetrySchedule({ maxRetries: 3 })),
      Effect.catchTags({
        BrawlhallaRateLimitError: () =>
          Effect.logWarning(
            `Rate limited while fetching ${formatCrawlTask(task)}, giving up after retries`,
          ).pipe(Effect.as(0)),
        BrawlhallaApiError: (error) =>
          Effect.logError(
            `API error fetching ${formatCrawlTask(task)}: ${error.message}`,
          ).pipe(Effect.as(0)),
        SqlError: () =>
          Effect.logError(
            `Database error storing ${formatCrawlTask(task)}`,
          ).pipe(Effect.as(0)),
      }),
    )

    yield* Effect.log(`Stored ${count} entries for ${formatCrawlTask(task)}`)

    return count
  }).pipe(
    Effect.withSpan(
      `processCrawlTask-${task.type}-${task.region}-${task.page}`,
    ),
  )

/**
 * Run the leaderboard crawler
 */
export const runLeaderboardCrawler = Effect.gen(function* () {
  yield* Effect.log("Starting leaderboard crawler")

  const tasks = generateCrawlTasks()
  yield* Effect.log(`Generated ${tasks.length} crawl tasks`)

  // Track total entries stored
  let totalEntries = 0

  yield* Effect.forEach(
    tasks,
    (task) =>
      processCrawlTask(task).pipe(
        Effect.tap((count) => {
          totalEntries += count
        }),
      ),
    { concurrency: 1 },
  )

  yield* Effect.log(
    `Leaderboard crawler completed. Stored ${totalEntries} total entries.`,
  )
}).pipe(Effect.scoped, Effect.withSpan("runLeaderboardCrawler"))

/**
 * Run the leaderboard crawler on a schedule (every 10 minutes)
 */
export const scheduleLeaderboardCrawler = createScheduledCrawler(
  "leaderboard crawler",
  runLeaderboardCrawler,
  schedulePresets.frequent,
)
