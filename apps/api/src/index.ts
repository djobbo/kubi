import { Api } from "@dair/api-contract"
import { HttpApiBuilder, HttpServer, FetchHttpClient } from "@effect/platform"
import { BunHttpServer } from "@effect/platform-bun"
import { Effect, Layer, Duration, flow } from "effect"
import { ApiLive } from "./api-live"
import { Archive } from "./services/archive"
import { Authorization } from "./services/authorization"
import { Cache } from "./services/cache"
import { ApiServerConfig } from "./services/config/api-server-config"
import { Database } from "./services/db"
import * as Docs from "./services/docs"
import { BrawlhallaApi } from "./services/brawlhalla-api"
import { BrawltoolsApi } from "./services/brawltools-api"
import { Fetcher } from "./services/fetcher"
import { responseCache } from "./services/middleware/response-cache"
import { workerAuthMiddleware } from "./services/middleware/worker-auth"
import { ObservabilityLive } from "./services/observability"
import { BrawlhallaRateLimiter } from "@/services/rate-limiter"

// Shared dependencies for both server and workers
// BrawlhallaApi includes its own rate limiter layer
const SharedDependencies = Layer.mergeAll(
  BrawlhallaApi.layer,
  BrawltoolsApi.layer,
  Archive.layer,
  Authorization.layer,
  Cache.layer,
  Fetcher.layer,
  Database.layer,
)

// Compose middleware: worker auth -> response cache
const composedMiddleware = flow(
  workerAuthMiddleware,
  responseCache({
    ttlSeconds: Duration.toSeconds(Duration.minutes(5)),
    exclude: ["/auth", "/health", "/session", "/docs", "/openapi"],
  }),
)

const ServerLive = Layer.unwrapEffect(
  Effect.gen(function* () {
    const serverConfig = yield* ApiServerConfig

    return HttpApiBuilder.serve(composedMiddleware).pipe(
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
  Layer.provide(ObservabilityLive),
  Layer.provide(BrawlhallaRateLimiter.layer),
)

const server = Layer.launch(ServerLive).pipe(
  Effect.catchAllCause(Effect.logError),
)

await Effect.runPromise(server)
