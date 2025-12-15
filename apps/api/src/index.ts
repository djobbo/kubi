import { Api } from "@dair/api-contract"
import { HttpApiBuilder, HttpServer, FetchHttpClient } from "@effect/platform"
import { BunHttpServer } from "@effect/platform-bun"
import { Effect, Layer } from "effect"
import { ApiLive } from "./api-live"
import { Archive } from "./services/archive"
import { Authorization } from "./services/authorization"
import { Cache } from "./services/cache"
import { ApiServerConfig } from "./services/config/api-server-config"
import { Database } from "./services/db"
import * as Docs from "./services/docs"
import { BrawlhallaApi } from "./services/brawlhalla-api"
import { Fetcher } from "./services/fetcher"
import { responseCache } from "./services/middleware/response-cache"
import { ObservabilityLive } from "./services/observability"
import { scheduleRankingsCrawler } from "./workers/rankings-crawler"
import { scheduleLeaderboardCrawler } from "./workers/leaderboard-crawler"
import { Duration } from "effect"

// Shared dependencies for both server and workers
const SharedDependencies = Layer.mergeAll(
  BrawlhallaApi.layer,
  Archive.layer,
  Authorization.layer,
  Cache.layer,
  Fetcher.layer,
  Database.layer,
)

const ServerLive = Layer.unwrapEffect(
  Effect.gen(function* () {
    const serverConfig = yield* ApiServerConfig

    return HttpApiBuilder.serve(
      responseCache({
        ttlSeconds: Duration.toSeconds(Duration.minutes(5)),
        exclude: ["/auth/", "/health", "/session"],
      }),
    ).pipe(
      Layer.provide(
        HttpApiBuilder.middlewareCors({
          allowedOrigins: serverConfig.allowedOrigins,
          allowedMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        }),
      ),
      HttpServer.withLogAddress,
      Layer.provide(ApiLive),
      Layer.provide(BunHttpServer.layer({ port: serverConfig.port })),
      Layer.provide(SharedDependencies),
      // Infrastructure layers
      Layer.provide(Docs.layer(Api)),
    )
  }),
).pipe(
  Layer.provide(ApiServerConfig.layer),
  Layer.provide(FetchHttpClient.layer),
  Layer.provide(Cache.layer),
)

// Dependencies for rankings crawler worker
const WorkerDependencies = Layer.mergeAll(
  SharedDependencies,
  FetchHttpClient.layer,
)

const rankingsCrawlerWorker = scheduleRankingsCrawler.pipe(
  Effect.provide(WorkerDependencies),
  Effect.catchAllCause((cause) =>
    Effect.logError("Rankings crawler worker crashed", cause),
  ),
)

const leaderboardCrawlerWorker = scheduleLeaderboardCrawler.pipe(
  Effect.provide(WorkerDependencies),
  Effect.catchAllCause((cause) =>
    Effect.logError("Ranked queues crawler worker crashed", cause),
  ),
)

const server = Effect.gen(function* () {
  // Fork the rankings and ranked queues crawlers to run in the background
  yield* Effect.fork(rankingsCrawlerWorker)
  yield* Effect.fork(leaderboardCrawlerWorker)

  // Launch the HTTP server (this blocks forever)
  return yield* Layer.launch(ServerLive)
}).pipe(
  Effect.provide(ObservabilityLive),
  Effect.catchAllCause(Effect.logError),
)

await Effect.runPromise(server)
