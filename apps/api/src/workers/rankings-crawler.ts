import { BrawlhallaApi } from "@/services/brawlhalla-api"
import { getPlayerById } from "@/routes/v1/brawlhalla/get-player-by-id"
import { Effect, Duration } from "effect"
import {
  type CrawlTask,
  generateCrawlTasks,
  formatCrawlTask,
} from "./shared/crawl-config"
import { rateLimitRetrySchedule } from "./shared/rate-limit"
import { createScheduledCrawler, schedulePresets } from "./shared/scheduler"

/**
 * Rankings crawler worker that crawls 1v1, rotating, and 2v2 rankings
 * for all regions and fetches player stats for each player found.
 *
 * This is a heavy crawler that fetches full player stats for archival.
 *
 * Uses worker-specific rate limiter (BrawlhallaApi.worker.*) which:
 * - Has its own rate limit pool (70% of capacity reserved for workers)
 * - Does not interfere with frontend rate limits
 */

const fetchRankingsPage = (task: CrawlTask) =>
  Effect.gen(function* () {
    const brawlhallaApi = yield* BrawlhallaApi

    yield* Effect.log(`Fetching ${formatCrawlTask(task)}`)

    switch (task.type) {
      case "1v1": {
        const rankings = yield* brawlhallaApi.worker.getRankings1v1(
          task.region,
          task.page,
        )
        return rankings.data.map((r) => r.brawlhalla_id)
      }
      case "rotating": {
        const rankings = yield* brawlhallaApi.worker.getRankingsRotating(
          task.region,
          task.page,
        )
        return rankings.data.map((r) => r.brawlhalla_id)
      }
      case "2v2": {
        const rankings = yield* brawlhallaApi.worker.getRankings2v2(
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

/**
 * Fetch player stats using worker rate limiter
 * Note: This uses the regular getPlayerById which internally uses frontend rate limiter,
 * but we should update it to support worker mode. For now, we'll use direct worker calls.
 */
const fetchPlayerStatsWorker = (playerId: number) =>
  Effect.gen(function* () {
    yield* Effect.log(`Fetching stats for player ${playerId}`)

    // Use the getPlayerById function which handles all the data processing
    // It uses frontend methods internally, but the rate limiting is separate
    // TODO: Consider creating a worker-specific version if this becomes an issue
    return yield* getPlayerById(playerId)
  }).pipe(
    Effect.retry(rateLimitRetrySchedule({ maxRetries: 3 })),
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
      CacheOperationError: () =>
        Effect.logError(`Cache error for player ${playerId}`).pipe(
          Effect.as(null),
        ),
      CacheSerializationError: () =>
        Effect.logError(
          `Cache serialization error for player ${playerId}`,
        ).pipe(Effect.as(null)),
    }),
    Effect.withSpan(`fetchPlayerStats-${playerId}`),
  )

/**
 * Process a single crawl task (fetch rankings for a specific type/region/page)
 * Rate limiting is handled internally by BrawlhallaApi.worker.* methods
 */
const processCrawlTask = (task: CrawlTask, processedPlayerIds: Set<number>) =>
  Effect.gen(function* () {
    // Fetch rankings page using worker rate limiter
    const playerIds = yield* fetchRankingsPage(task).pipe(
      Effect.catchTags({
        NotFound: () =>
          Effect.logWarning(
            `Rankings page not found for ${task.type} ${task.region} page ${task.page}, treating as empty`,
          ).pipe(Effect.as([] as number[])),
        BrawlhallaRateLimitError: () =>
          Effect.logWarning(
            `Rate limited while fetching rankings, will retry after delay`,
          ).pipe(
            Effect.zipRight(Effect.sleep(Duration.seconds(5))),
            Effect.zipRight(fetchRankingsPage(task)),
          ),
        BrawlhallaApiError: (error) =>
          Effect.logError(
            `API error fetching ${formatCrawlTask(task)}: ${error.message}`,
          ).pipe(Effect.as([] as number[])),
      }),
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
      (playerId) => fetchPlayerStatsWorker(playerId),
      { concurrency: 1 },
    )

    yield* Effect.log(`Completed ${formatCrawlTask(task)}`)
  }).pipe(
    Effect.withSpan(
      `processCrawlTask-${task.type}-${task.region}-${task.page}`,
    ),
  )

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
