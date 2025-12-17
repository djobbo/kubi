import { Duration, Effect, Fiber, Schedule, Stream } from "effect"
import { WorkerApiClient } from "@/services/api-client"

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
        page,
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

  const taskStream = Stream.repeat(
    Stream.fromIterable(tasks).pipe(
      Stream.schedule(Schedule.spaced("1 second")),
    ),
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

const program = Effect.gen(function* () {
  yield* Effect.log("Starting workers")
  const worker = yield* Effect.fork(defineRankedWorker("Ranked Worker"))
  yield* Effect.sleep(Duration.seconds(1))
  const playerWorker = yield* Effect.fork(
    defineRankedWorker("Player Worker", true),
  )
  yield* Fiber.await(worker)
  yield* Fiber.await(playerWorker)
  yield* Effect.log("Workers completed")
})

await Effect.runPromise(program.pipe(Effect.provide(WorkerApiClient.layer)))
