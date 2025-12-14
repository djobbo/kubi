import { Api } from "@dair/api-contract"
import { HttpApiBuilder, HttpServer, FetchHttpClient } from "@effect/platform"
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
import { ObservabilityLive } from "./services/observability"

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
).pipe(
  Layer.provide(ApiServerConfig.layer),
  Layer.provide(FetchHttpClient.layer),
)

const server = Layer.launch(ServerLive).pipe(
  Effect.provide(ObservabilityLive),
  Effect.catchAllCause(Effect.logError),
)
await Effect.runPromise(server)
// import { Effect } from "effect"
// import { NodeSdk } from "@effect/opentelemetry"
// import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base"
// import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http"

// const poll = task("/poll", 1)

// // Create a program with tasks and subtasks
// const program = task("client", 2, [
//   task("/api", 3, [
//     task("/authN", 4, [task("/authZ", 5)]),
//     task("/payment Gateway", 6, [task("DB", 7), task("Ext. Merchant", 8)]),
//     task("/dispatch", 9, [
//       task("/dispatch/search", 10),
//       Effect.all([poll, poll, poll], { concurrency: "inherit" }),
//       task("/pollDriver/{id}", 11),
//     ]),
//   ]),
// ])

// const NodeSdkLive = NodeSdk.layer(() => ({
//   resource: { serviceName: "api" },
//   spanProcessor: new BatchSpanProcessor(
//     new OTLPTraceExporter({
//       url: "http://alloy:4318/v1/traces",
//     }),
//   ),
// }))

// await Effect.runPromise(
//   program.pipe(
//     Effect.provide(NodeSdkLive),
//     Effect.catchAllCause(Effect.logError),
//   ),
// )
