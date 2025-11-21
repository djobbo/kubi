import { Api } from "@dair/api-contract"
import { FetchHttpClient, HttpApiBuilder, HttpServer } from "@effect/platform"
import { BunHttpServer } from "@effect/platform-bun"
import { Effect, Layer } from "effect"
import { ApiLive } from "./api-live"
import * as Archive from "./services/archive"
import * as Authorization from "./services/authorization"
import { Config, ConfigLive } from "./services/config"
import { ConfigError } from "./services/config/errors"
import * as DB from "./services/db"
import * as Docs from "./services/docs"
import { BrawlhallaApiLive } from "./services/brawlhalla-api"
import { FetcherLive } from "./services/fetcher"

/**
 * Main application layer with proper dependency composition
 */
const ServerLive = Effect.gen(function* () {
  const config = yield* Config

  return HttpApiBuilder.serve().pipe(
    Layer.provide(
      HttpApiBuilder.middlewareCors({
        allowedOrigins: config.api.allowedOrigins,
        allowedMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      }),
    ),
    HttpServer.withLogAddress,
    Layer.provide(ApiLive),
    Layer.provide(BunHttpServer.layer({ port: config.api.port })),
    // Service layers
    Layer.provide(BrawlhallaApiLive),
    Layer.provide(Archive.ArchiveLive),
    Layer.provide(Authorization.AuthorizationLive),
    Layer.provide(FetcherLive),
    Layer.provide(DB.DBLive),
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
  Effect.provide(ConfigLive),
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
