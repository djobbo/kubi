import { Api } from "@dair/api-contract"
import { FetchHttpClient, HttpApiBuilder, HttpServer } from "@effect/platform"
import { BunHttpServer } from "@effect/platform-bun"
import { Effect, Layer } from "effect"
import { ApiLive } from "./api-live"
import { Archive } from "./services/archive"
import { Authorization } from "./services/authorization"
import { ApiServerConfig } from "./services/config/api-server-config"
import { ConfigError } from "./services/config/errors"
import { DB } from "./services/db"
import * as Docs from "./services/docs"
import { BrawlhallaApi } from "./services/brawlhalla-api"
import { Fetcher } from "./services/fetcher"

/**
 * Main application layer with proper dependency composition
 */
const ServerLive = Effect.gen(function* () {
  const serverConfig = yield* ApiServerConfig

  return HttpApiBuilder.serve().pipe(
    Layer.provide(
      HttpApiBuilder.middlewareCors({
        allowedOrigins: serverConfig.allowedOrigins,
        allowedMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      }),
    ),
    HttpServer.withLogAddress,
    Layer.provide(ApiLive),
    Layer.provide(BunHttpServer.layer({ port: serverConfig.port })),
    // Service layers (each self-contained with their config)
    Layer.provide(BrawlhallaApi.layer),
    Layer.provide(Archive.layer),
    Layer.provide(Authorization.layer),
    Layer.provide(Fetcher.layer),
    Layer.provide(DB.layer),
    // Infrastructure layers
    Layer.provide(FetchHttpClient.layer),
    Layer.provide(Docs.layer(Api)),
  )
})

/**
 * Application entry point
 */
const app = Effect.gen(function* () {
  const server = yield* ServerLive
  return yield* Layer.launch(server)
}).pipe(
  Effect.catchAll((error) => {
    console.error("Fatal error:", error)
    return Effect.die(error)
  }),
  Effect.provide(ApiServerConfig.layer),
)

Effect.runFork(
  app.pipe(
    Effect.catchTag("ConfigError", (error: ConfigError) => {
      console.error("Configuration error:", error.message)
      console.error("Please check your environment variables")
      return Effect.die(error)
    }),
    Effect.catchAll(Effect.logError),
  ),
)
