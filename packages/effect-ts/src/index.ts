import { ApiLive } from './api'
import { HttpApiBuilder, HttpApiSwagger, HttpServer } from "@effect/platform"
import { BunHttpServer, BunRuntime } from "@effect/platform-bun"
import { Layer } from "effect"
import * as Archive from "./services/archive"
import * as BrawlhallaApi from "./services/brawlhalla-api"

import * as Fetcher from "./helpers/fetcher"
import * as DB from "./services/db"

const ServerLive = HttpApiBuilder.serve().pipe(
	Layer.provide(HttpApiBuilder.middlewareCors({
		allowedOrigins: [],
	})),
	Layer.provide(HttpApiSwagger.layer()),
	HttpServer.withLogAddress,
	Layer.provide(ApiLive),
	Layer.provide(BunHttpServer.layer({ port: 3000, hostname: "0.0.0.0" })),
	Layer.provide(BrawlhallaApi.fromEnv),
	Layer.provide(Archive.layer()),
	Layer.provide(Fetcher.fromEnv),
	Layer.provide(DB.fromEnv),
)

Layer.launch(ServerLive).pipe(BunRuntime.runMain)
