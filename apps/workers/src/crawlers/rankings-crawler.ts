import { WorkerApiClient } from "@/services/api-client"
import { WorkerRateLimiter } from "@/services/rate-limiter"
import { Effect, Duration } from "effect"
import {
  type CrawlTask,
  generateCrawlTasks,
  formatCrawlTask,
} from "@/shared/crawl-config"
import { rateLimitRetrySchedule } from "@/shared/retry"
import { createScheduledCrawler, schedulePresets } from "@/shared/scheduler"

/**
 * Rankings crawler worker that crawls 1v1, rotating, and 2v2 rankings
 * for all regions and fetches player stats for each player found.
 *
 * This is a heavy crawler that fetches full player stats for archival.
 * It calls the API via HTTP with the worker API key.
 *
 * Uses its own rate limiter to control how fast it calls the API.
 */

/**
 * Fetch rankings page and extract player IDs
 */
const fetchRankingsPage = (task: CrawlTask) =>
  Effect.gen(function* () {
    const apiClient = yield* WorkerApiClient
    const rateLimiter = yield* WorkerRateLimiter

    yield* Effect.log(`Fetching ${formatCrawlTask(task)}`)

    // Extract player IDs from the response based on task type
    if (task.type === "1v1") {
      const response = yield* rateLimiter.limit(
        apiClient.brawlhalla.getRankings1v1(task.region, task.page),
      )
      return response.data.map((r) => r.id)
    } else if (task.type === "rotating") {
      const response = yield* rateLimiter.limit(
        apiClient.brawlhalla.getRankingsRotating(task.region, task.page),
      )
      return response.data.map((r) => r.id)
    } else {
      // 2v2 has two players per team
      const response = yield* rateLimiter.limit(
        apiClient.brawlhalla.getRankings2v2(task.region, task.page),
      )
      return response.data.flatMap((r) => r.team.map((p) => p.id))
    }
  }).pipe(
    Effect.withSpan(
      `fetchRankingsPage-${task.type}-${task.region}-${task.page}`,
    ),
  )

/**
 * Fetch player stats via API
 * The API will automatically archive the data when called with worker key
 */
const fetchPlayerStats = (playerId: number) =>
  Effect.gen(function* () {
    const apiClient = yield* WorkerApiClient
    const rateLimiter = yield* WorkerRateLimiter

    yield* Effect.log(`Fetching stats for player ${playerId}`)

    yield* rateLimiter.limit(apiClient.brawlhalla.getPlayerById(playerId))

    yield* Effect.log(`Completed stats for player ${playerId}`)
  }).pipe(
    Effect.retry(rateLimitRetrySchedule({ maxRetries: 3 })),
    Effect.catchAll((error) =>
      Effect.logWarning(
        `Failed to fetch player ${playerId}: ${String(error)}`,
      ).pipe(Effect.as(null)),
    ),
    Effect.withSpan(`fetchPlayerStats-${playerId}`),
  )

/**
 * Process a single crawl task (fetch rankings for a specific type/region/page)
 * Then fetch stats for each unique player
 */
const processCrawlTask = (task: CrawlTask, processedPlayerIds: Set<number>) =>
  Effect.gen(function* () {
    // Fetch rankings page
    const playerIds = yield* fetchRankingsPage(task).pipe(
      Effect.catchAll((error) =>
        Effect.logWarning(
          `API error fetching ${formatCrawlTask(task)}: ${String(error)}`,
        ).pipe(Effect.as([] as number[])),
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

    // Fetch stats for each unique player sequentially to respect rate limiting
    yield* Effect.forEach(
      uniquePlayerIds,
      (playerId) => fetchPlayerStats(playerId),
      { concurrency: 1 },
    )

    yield* Effect.log(`Completed ${formatCrawlTask(task)}`)
  }).pipe(
    Effect.withSpan(
      `processCrawlTask-${task.type}-${task.region}-${task.page}`,
    ),
  )

/**
 * Run the rankings crawler
 */
export const runRankingsCrawler = Effect.gen(function* () {
  yield* Effect.log("Starting rankings crawler")

  const tasks = generateCrawlTasks()
  yield* Effect.log(`Generated ${tasks.length} crawl tasks`)

  // Track processed player IDs to avoid duplicate fetches
  const processedPlayerIds = new Set<number>()

  yield* Effect.forEach(
    tasks,
    (task) => processCrawlTask(task, processedPlayerIds),
    { concurrency: 1 },
  )

  yield* Effect.log(
    `Rankings crawler completed. Processed ${processedPlayerIds.size} unique players.`,
  )
}).pipe(Effect.scoped, Effect.withSpan("runRankingsCrawler"))

/**
 * Run the rankings crawler on a schedule (every 6 hours)
 */
export const scheduleRankingsCrawler = createScheduledCrawler(
  "rankings crawler",
  runRankingsCrawler,
  schedulePresets.sixHours,
)
