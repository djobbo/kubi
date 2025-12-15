import { BrawlhallaApi } from "@/services/brawlhalla-api"
import { getPlayerById } from "@/routes/v1/brawlhalla/get-player-by-id"
import { regions } from "@dair/api-contract/src/shared/region"
import { Effect, RateLimiter, Schedule, Duration } from "effect"

/**
 * Rankings crawler worker that crawls 1v1, rotating, and 2v2 rankings
 * for all regions and fetches player stats for each player found.
 *
 * Rate limited to 3 requests per second to avoid API rate limits.
 */

type RankingType = "1v1" | "rotating" | "2v2"

// Regions with 5 pages: eu, us-e, sa
// Other regions get 3 pages
const regionPageCounts: Record<(typeof regions)[number], number> = {
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

type CrawlTask = {
  region: (typeof regions)[number]
  page: number
  type: RankingType
}

const generateCrawlTasks = (): CrawlTask[] => {
  const tasks: CrawlTask[] = []
  const rankingTypes: RankingType[] = ["1v1", "rotating", "2v2"]

  for (const region of regions) {
    const pageCount = regionPageCounts[region]
    for (let page = 1; page <= pageCount; page++) {
      for (const type of rankingTypes) {
        tasks.push({ region, page, type })
      }
    }
  }

  return tasks
}

const fetchRankingsPage = (task: CrawlTask) =>
  Effect.gen(function* () {
    const brawlhallaApi = yield* BrawlhallaApi

    yield* Effect.log(
      `Fetching ${task.type} rankings for ${task.region} page ${task.page}`,
    )

    switch (task.type) {
      case "1v1": {
        const rankings = yield* brawlhallaApi.getRankings1v1(
          task.region,
          task.page,
        )
        return rankings.data.map((r) => r.brawlhalla_id)
      }
      case "rotating": {
        const rankings = yield* brawlhallaApi.getRankingsRotating(
          task.region,
          task.page,
        )
        return rankings.data.map((r) => r.brawlhalla_id)
      }
      case "2v2": {
        const rankings = yield* brawlhallaApi.getRankings2v2(
          task.region,
          task.page,
        )
        // 2v2 has two players per team
        return rankings.data.flatMap((r) => [
          r.brawlhalla_id_one,
          r.brawlhalla_id_two,
        ])
      }
    }
  }).pipe(
    Effect.withSpan(
      `fetchRankingsPage-${task.type}-${task.region}-${task.page}`,
    ),
  )

const fetchPlayerStats = (playerId: number) =>
  Effect.gen(function* () {
    yield* Effect.log(`Fetching stats for player ${playerId}`)

    return yield* getPlayerById(playerId)
  }).pipe(
    // Retry on rate limit with exponential backoff
    Effect.retry(
      Schedule.exponential(Duration.seconds(5)).pipe(
        Schedule.whileInput(
          (error: unknown) =>
            error !== null &&
            typeof error === "object" &&
            "_tag" in error &&
            error._tag === "BrawlhallaRateLimitError",
        ),
        Schedule.intersect(Schedule.recurs(3)), // Max 3 retries
      ),
    ),
    Effect.catchTags({
      BrawlhallaPlayerNotFound: (error) =>
        Effect.logWarning(`Player ${error.playerId} not found, skipping`).pipe(
          Effect.as(null),
        ),
      BrawlhallaRateLimitError: () =>
        Effect.logWarning(
          `Rate limited while fetching player ${playerId}, giving up after retries`,
        ).pipe(Effect.as(null)),
      BrawlhallaApiError: (error) =>
        Effect.logError(
          `API error fetching player ${playerId}: ${error.message}`,
        ).pipe(Effect.as(null)),
      SqlError: () =>
        Effect.logError(`Database error for player ${playerId}`).pipe(
          Effect.as(null),
        ),
    }),
    Effect.withSpan(`fetchPlayerStats-${playerId}`),
  )

const processCrawlTask = (
  task: CrawlTask,
  rateLimiter: RateLimiter.RateLimiter,
  processedPlayerIds: Set<number>,
) =>
  Effect.gen(function* () {
    // Rate limit the rankings fetch
    const playerIds = yield* rateLimiter(
      fetchRankingsPage(task).pipe(
        Effect.catchTags({
          BrawlhallaRateLimitError: () =>
            Effect.logWarning(
              `Rate limited while fetching rankings, will retry after delay`,
            ).pipe(
              Effect.zipRight(Effect.sleep(Duration.seconds(5))),
              Effect.zipRight(rateLimiter(fetchRankingsPage(task))),
            ),
          BrawlhallaApiError: (error) =>
            Effect.logError(
              `API error fetching ${task.type} rankings for ${task.region} page ${task.page}: ${error.message}`,
            ).pipe(Effect.as([] as number[])),
        }),
      ),
    )

    // Deduplicate player IDs (important for 2v2 where players can appear multiple times)
    const uniquePlayerIds = playerIds.filter(
      (id) => !processedPlayerIds.has(id),
    )

    yield* Effect.log(
      `Found ${uniquePlayerIds.length} unique players to fetch (${playerIds.length - uniquePlayerIds.length} already processed)`,
    )

    // Mark these players as processed
    for (const id of uniquePlayerIds) {
      processedPlayerIds.add(id)
    }

    // Fetch stats for each unique player with rate limiting
    yield* Effect.forEach(
      uniquePlayerIds,
      (playerId) => rateLimiter(fetchPlayerStats(playerId)),
      { concurrency: 1 }, // Sequential to respect rate limiting
    )

    yield* Effect.log(
      `Completed ${task.type} rankings for ${task.region} page ${task.page}`,
    )
  }).pipe(
    Effect.withSpan(
      `processCrawlTask-${task.type}-${task.region}-${task.page}`,
    ),
  )

export const runRankingsCrawler = Effect.gen(function* () {
  yield* Effect.log("Starting rankings crawler")

  // Create rate limiter: 3 requests per second
  // Using scoped to ensure proper cleanup
  const rateLimiter = yield* RateLimiter.make({
    limit: 3,
    interval: Duration.seconds(1),
  })

  const tasks = generateCrawlTasks()
  yield* Effect.log(`Generated ${tasks.length} crawl tasks`)

  // Track processed player IDs to avoid duplicate fetches
  const processedPlayerIds = new Set<number>()

  // Process all tasks sequentially (rate limiting handles the timing)
  yield* Effect.forEach(
    tasks,
    (task) => processCrawlTask(task, rateLimiter, processedPlayerIds),
    { concurrency: 1 },
  )

  yield* Effect.log(
    `Rankings crawler completed. Processed ${processedPlayerIds.size} unique players.`,
  )
}).pipe(Effect.scoped, Effect.withSpan("runRankingsCrawler"))

/**
 * Schedule to run the crawler periodically.
 * Runs once immediately, then every 6 hours.
 */
export const rankingsCrawlerSchedule = Schedule.union(
  Schedule.once,
  Schedule.spaced(Duration.hours(6)),
)

/**
 * Run the rankings crawler on a schedule (every 6 hours)
 */
export const scheduleRankingsCrawler = Effect.gen(function* () {
  yield* Effect.log("Scheduling rankings crawler to run every 6 hours")

  yield* Effect.repeat(
    runRankingsCrawler.pipe(
      Effect.catchAllCause((cause) =>
        Effect.logError("Rankings crawler failed", cause),
      ),
    ),
    rankingsCrawlerSchedule,
  )
})
