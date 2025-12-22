import { HttpClient, FetchHttpClient } from "@effect/platform"
import { WorkerConfig } from "@/services/config"
import {
  Duration,
  Effect,
  Fiber,
  Layer,
  Option,
  Schedule,
  Stream,
} from "effect"
import { WorkerApiClient } from "@/services/api-client"

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
    Schedule.linear(Duration.seconds(1)).pipe(
      Schedule.union(Schedule.spaced(Duration.seconds(5))),
    ),
  )
}).pipe(Effect.provide(FetchHttpClient.layer))

export const generateCrawlTasks = <
  Bracket extends string,
  Region extends string,
>({
  brackets,
  regions,
  pageCounts,
}: {
  brackets: Bracket[]
  regions: Region[]
  pageCounts: NoInfer<Record<Region, number>>
}) => {
  return brackets.flatMap((bracket) =>
    regions.flatMap((region) =>
      Array.from({ length: pageCounts[region] }).map((_, page) => ({
        region,
        page: page + 1,
        bracket,
      })),
    ),
  )
}
const defineRankedWorker = Effect.fn("worker")(function* (
  workerName: string,
  processPlayers: boolean = false,
) {
  yield* Effect.log(`Starting ${workerName} worker`)
  const apiClient = yield* WorkerApiClient
  const tasks = generateCrawlTasks({
    brackets: ["1v1", "2v2", "rotating"],
    regions: ["eu", "us-e", "sa", "sea", "brz", "aus", "us-w", "jpn", "me"],
    pageCounts: {
      eu: 5,
      "us-e": 5,
      sa: 3,
      sea: 3,
      brz: 5,
      aus: 3,
      "us-w": 3,
      jpn: 3,
      me: 3,
    },
  })

  const interval = processPlayers
    ? Duration.seconds(1)
    : Duration.divide(tasks.length)(Duration.minutes(15)).pipe(
        Option.getOrElse(() => Duration.seconds(1)),
      )

  const taskStream = Stream.repeat(
    Stream.fromIterable(tasks).pipe(Stream.schedule(Schedule.spaced(interval))),
    Schedule.forever,
  )

  const formatCrawlTask = (task: (typeof tasks)[number]) =>
    `${workerName}: ${task.bracket} rankings for ${task.region} page ${task.page}`

  yield* Stream.runForEach(taskStream, (task) =>
    Effect.gen(function* () {
      yield* Effect.log(
        `${workerName}: Processing task ${formatCrawlTask(task)}`,
      )
      const { data: rankings } = yield* apiClient.brawlhalla.getRankings1v1(
        task.region,
        task.page,
      )
      yield* Effect.log(
        `${workerName}: Completed task ${formatCrawlTask(task)}`,
      )

      if (processPlayers) {
        const playerStream = Stream.fromIterable(rankings).pipe(
          Stream.schedule(Schedule.spaced("1 second")),
        )
        yield* Stream.runForEach(playerStream, (player) =>
          Effect.gen(function* () {
            yield* Effect.log(`${workerName}: Fetching player ${player.id}`)
            yield* apiClient.brawlhalla.getPlayerById(player.id)
            yield* Effect.log(`${workerName}: Completed player ${player.id}`)
          }).pipe(Effect.withSpan(`fetchPlayer-${player.id}`)),
        ).pipe(
          Effect.timeout(Duration.seconds(10)),
          Effect.retry(
            Schedule.union(
              Schedule.spaced("10 second"),
              Schedule.linear("1 second"),
            ),
          ),
          Effect.withSpan(
            `processPlayer-${task.bracket}-${task.region}-${task.page}`,
          ),
        )
      }
    }).pipe(
      Effect.timeout(Duration.seconds(10)),
      Effect.retry(
        Schedule.union(
          Schedule.spaced("10 second"),
          Schedule.linear("1 second"),
        ),
      ),
      Effect.withSpan(
        `processCrawlTask-${task.bracket}-${task.region}-${task.page}`,
      ),
    ),
  )

  yield* Effect.log(`${workerName} worker completed`)
})

const SharedDependencies = Layer.mergeAll(
  WorkerConfig.layer,
  WorkerApiClient.layer,
)

const program = Effect.gen(function* () {
  yield* waitForApiHealth
  yield* Effect.log("Starting workers")
  const worker = yield* Effect.fork(defineRankedWorker("Ranked Worker"))
  yield* Effect.sleep(Duration.seconds(1))
  const playerWorker = yield* Effect.fork(
    defineRankedWorker("Player Worker", true),
  )
  yield* Fiber.await(worker)
  yield* Fiber.await(playerWorker)
  yield* Effect.log("Workers completed")
}).pipe(Effect.provide(SharedDependencies))

await Effect.runPromise(program)
