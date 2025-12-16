import { WorkerApiClient } from "@/services/api-client"
import { WorkerRateLimiter } from "@/services/rate-limiter"
import { Effect } from "effect"
import {
  type CrawlTask,
  generateCrawlTasks,
  formatCrawlTask,
} from "@/shared/crawl-config"
import { rateLimitRetrySchedule } from "@/shared/retry"
import { createScheduledCrawler, schedulePresets } from "@/shared/scheduler"

/**
 * Leaderboard crawler worker that crawls 1v1, 2v2, and rotating rankings
 * for all regions.
 *
 * This crawler calls the API via HTTP with the worker API key.
 * The API automatically archives the data when called with the worker key.
 *
 * Uses its own rate limiter to control how fast it calls the API.
 */

/**
 * Fetch rankings page via API
 * The API will automatically archive the data when called with worker key
 */
const fetchRankingsPage = (task: CrawlTask) =>
  Effect.gen(function* () {
    const apiClient = yield* WorkerApiClient
    const rateLimiter = yield* WorkerRateLimiter

    yield* Effect.log(`Fetching ${formatCrawlTask(task)}`)

    // Apply rate limiting to the API call
    if (task.type === "1v1") {
      yield* rateLimiter.limit(
        apiClient.brawlhalla.getRankings1v1(task.region, task.page),
      )
    } else if (task.type === "2v2") {
      yield* rateLimiter.limit(
        apiClient.brawlhalla.getRankings2v2(task.region, task.page),
      )
    } else {
      yield* rateLimiter.limit(
        apiClient.brawlhalla.getRankingsRotating(task.region, task.page),
      )
    }

    yield* Effect.log(`Completed ${formatCrawlTask(task)}`)
  }).pipe(
    Effect.withSpan(
      `fetchRankingsPage-${task.type}-${task.region}-${task.page}`,
    ),
  )

/**
 * Process a single crawl task with retry logic
 */
const processCrawlTask = (task: CrawlTask) =>
  fetchRankingsPage(task).pipe(
    Effect.retry(rateLimitRetrySchedule({ maxRetries: 3 })),
    Effect.catchAll((error) =>
      Effect.logWarning(
        `Failed to fetch ${formatCrawlTask(task)}: ${String(error)}`,
      ),
    ),
  )

/**
 * Run the leaderboard crawler
 */
export const runLeaderboardCrawler = Effect.gen(function* () {
  yield* Effect.log("Starting leaderboard crawler")

  const tasks = generateCrawlTasks()
  yield* Effect.log(`Generated ${tasks.length} crawl tasks`)

  yield* Effect.forEach(tasks, (task) => processCrawlTask(task), {
    concurrency: 1,
  })

  yield* Effect.log(`Leaderboard crawler completed.`)
}).pipe(Effect.scoped, Effect.withSpan("runLeaderboardCrawler"))

/**
 * Run the leaderboard crawler on a schedule (every 10 minutes)
 */
export const scheduleLeaderboardCrawler = createScheduledCrawler(
  "leaderboard crawler",
  runLeaderboardCrawler,
  schedulePresets.frequent,
)
