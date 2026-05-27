import "dotenv/config"

import { createServer } from "node:http"

import { Api } from "@dair/api-contract"
import { HttpApiBuilder } from "effect/unstable/httpapi"
import { FetchHttpClient, HttpRouter, HttpServer } from "effect/unstable/http"
import * as NodeHttpServer from "@effect/platform-node/NodeHttpServer"
import { Effect, Layer, Duration, flow } from "effect"
import { ApiLive } from "./api-live"
import { Archive } from "./services/archive"
import { Authorization } from "./services/authorization"
import { Cache } from "./services/cache"
import { ApiServerConfig } from "./services/config/api-server-config"
import { Database } from "./services/db"
import * as Docs from "./services/docs"
import { BrawlhallaApi } from "./services/brawlhalla-api"
import { BrawlhallaGql } from "./services/brawlhalla-gql"
import { BrawltoolsApi } from "./services/brawltools-api"
import { Fetcher } from "./services/fetcher"
import { responseCache } from "./services/middleware/response-cache"
import { workerAuthMiddleware } from "./services/middleware/worker-auth"
import { brawlhallaApiProxy } from "./services/proxy"
import { ObservabilityLive } from "./services/observability"
import { BrawlhallaRateLimiter } from "./services/rate-limiter"
import { ServerDiscovery } from "./services/server-discovery"
import { Bookmarks } from "./services/bookmarks"

const SharedDependencies = Layer.mergeAll(
  BrawlhallaApi.layer,
  BrawlhallaGql.layer,
  BrawlhallaRateLimiter.layer,
  BrawltoolsApi.layer,
  Archive.layer,
  Authorization.layer,
  Cache.layer,
  Fetcher.layer,
  Database.layer,
  ServerDiscovery.layer,
  Bookmarks.layer,
)

const composedMiddleware = flow(
  brawlhallaApiProxy,
  workerAuthMiddleware,
  responseCache({
    ttlSeconds: Duration.toSeconds(Duration.minutes(5)),
    exclude: ["/auth", "/health", "/session", "/docs", "/openapi", "/proxy"],
  }),
)

const ServerLive = Layer.unwrap(
  Effect.gen(function* () {
    const serverConfig = yield* ApiServerConfig

    const ApiRouterLive = HttpApiBuilder.layer(Api).pipe(
      Layer.provide(ApiLive),
      Layer.provide(Docs.layer(Api)),
      Layer.provide(
        HttpRouter.cors({
          allowedOrigins: serverConfig.allowedOrigins,
          allowedMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        }),
      ),
    )

    return HttpRouter.serve(ApiRouterLive, {
      middleware: composedMiddleware,
    }).pipe(
      HttpServer.withLogAddress,
      Layer.provide(
        NodeHttpServer.layer(createServer, {
          port: serverConfig.port,
        }),
      ),
      Layer.provide(SharedDependencies),
    )
  }),
).pipe(
  Layer.provide(ApiServerConfig.layer),
  Layer.provide(FetchHttpClient.layer),
  Layer.provide(ObservabilityLive),
)

const server = Layer.launch(ServerLive).pipe(Effect.catchCause(Effect.logError))

Effect.runPromise(server).catch((error) => {
  console.error(error)
  process.exit(1)
})
