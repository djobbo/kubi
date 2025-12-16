import { Effect, Layer, LogLevel, Logger, Schedule, Duration } from "effect"
import { HttpClient, FetchHttpClient } from "@effect/platform"
import { WorkerApiClient } from "@/services/api-client"
import { WorkerConfig } from "@/services/config"
import { WorkerRateLimiter } from "@/services/rate-limiter"
import { scheduleLeaderboardCrawler } from "@/crawlers/leaderboard-crawler"
import { scheduleRankingsCrawler } from "@/crawlers/rankings-crawler"

/**
 * Workers app entry point.
 *
 * Runs the leaderboard and rankings crawlers that call the API
 * via HTTP with worker authentication.
 */

/**
 * Check if the API is healthy by calling /health endpoint.
 * Retries with linear backoff (1s, 2s, 3s, ...) until successful.
 */
const waitForApiHealth = Effect.gen(function* () {
  const config = yield* WorkerConfig
  const httpClient = yield* HttpClient.HttpClient

  const healthUrl = `${config.apiUrl}/v1/health`

  yield* Effect.log(`Waiting for API to be healthy at ${healthUrl}...`)

  let attempt = 0

  yield* Effect.retry(
    Effect.gen(function* () {
      attempt++
      yield* Effect.log(`Health check attempt ${attempt}...`)

      const response = yield* httpClient.get(healthUrl).pipe(
        Effect.timeout(Duration.seconds(5)),
        Effect.catchAll((error) =>
          Effect.fail(new Error(`Health check failed: ${String(error)}`)),
        ),
      )

      if (response.status !== 200) {
        return yield* Effect.fail(
          new Error(`Health check returned status ${response.status}`),
        )
      }

      yield* Effect.log("API is healthy!")
    }),
    // Linear backoff: 1s, 2s, 3s, 4s, 5s, then cap at 5s
    Schedule.linear(Duration.seconds(1)).pipe(
      Schedule.union(Schedule.spaced(Duration.seconds(5))),
    ),
  )
}).pipe(Effect.provide(FetchHttpClient.layer))

// Shared dependencies for all workers
const SharedDependencies = Layer.mergeAll(
  WorkerApiClient.layer,
  WorkerRateLimiter.layer,
)

const leaderboardWorker = scheduleLeaderboardCrawler.pipe(
  Effect.provide(SharedDependencies),
  Effect.catchAllCause((cause) =>
    Effect.logError("Leaderboard crawler worker crashed", cause),
  ),
)

const rankingsWorker = scheduleRankingsCrawler.pipe(
  Effect.provide(SharedDependencies),
  Effect.catchAllCause((cause) =>
    Effect.logError("Rankings crawler worker crashed", cause),
  ),
)

const workers = Effect.gen(function* () {
  yield* Effect.log("Starting workers...")

  // Get config to log the API URL
  const config = yield* WorkerConfig
  yield* Effect.log(`API URL: ${config.apiUrl}`)

  // Wait for API to be healthy before starting crawlers
  yield* waitForApiHealth

  // Fork both workers to run concurrently
  const leaderboardFiber = yield* Effect.fork(leaderboardWorker)
  const rankingsFiber = yield* Effect.fork(rankingsWorker)

  yield* Effect.log("Workers started. Running indefinitely...")

  // Wait for both workers (they run forever unless they crash)
  yield* Effect.all([
    Effect.fromFiber(leaderboardFiber),
    Effect.fromFiber(rankingsFiber),
  ])
}).pipe(
  Effect.provide(WorkerConfig.layer),
  Logger.withMinimumLogLevel(LogLevel.Info),
  Effect.catchAllCause(Effect.logError),
)

await Effect.runPromise(workers)
