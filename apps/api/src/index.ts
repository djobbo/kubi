import { Api } from "@dair/api-contract"
import { HttpApiBuilder, HttpServer } from "@effect/platform"
import { BunHttpServer } from "@effect/platform-bun"
import { Effect, Layer } from "effect"
import { ApiLive } from "./api-live"
import { Archive } from "./services/archive"
import { Authorization } from "./services/authorization"
import { ApiServerConfig } from "./services/config/api-server-config"
import { Database } from "./services/db"
import * as Docs from "./services/docs"
import { BrawlhallaApi } from "./services/brawlhalla-api"
import { Fetcher } from "./services/fetcher"

const ServerLive = Layer.unwrapEffect(
  Effect.gen(function* () {
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
      Layer.provide(BrawlhallaApi.layer),
      Layer.provide(Archive.layer),
      Layer.provide(Authorization.layer),
      Layer.provide(Fetcher.layer),
      Layer.provide(Database.layer),
      // Infrastructure layers
      Layer.provide(Docs.layer(Api)),
    )
  }),
)

const server = Layer.launch(ServerLive)

Effect.runFork(server)
