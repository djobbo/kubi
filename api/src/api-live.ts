import { HttpApiBuilder } from "@effect/platform"
import { Effect, Layer } from "effect"

import { Api } from "@dair/api-contract"
import { InternalServerError } from "@effect/platform/HttpApiError"
import { deleteSession } from "./routes/v1/auth/delete-session"
import { getSession } from "./routes/v1/auth/get-session"
import { authorize } from "./routes/v1/auth/providers/authorize"
import { providerCallback } from "./routes/v1/auth/providers/callback"
import { getClanById } from "./routes/v1/brawlhalla/get-clan-by-id"
import { getPlayerById } from "./routes/v1/brawlhalla/get-player-by-id"
import { getPreviewArticles } from "./routes/v1/brawlhalla/get-preview-articles"
import {
	getRankings1v1,
	getRankings2v2,
} from "./routes/v1/brawlhalla/get-rankings"
import { getWeeklyRotation } from "./routes/v1/brawlhalla/get-weekly-rotation"

const HealthLive = HttpApiBuilder.group(Api, "health", (handlers) =>
	handlers.handle("health", () => Effect.succeed("OK")),
)

const BrawlhallaLive = HttpApiBuilder.group(Api, "brawlhalla", (handlers) =>
	handlers
		.handle(
			"get-player-by-id",
			Effect.fn("get-player-by-id")(function* ({ path }) {
				return yield* getPlayerById(path.id)
			}),
		)
		.handle("get-clan-by-id", ({ path }) => getClanById(path.id))
		.handle("get-rankings-1v1", ({ path, urlParams }) =>
			getRankings1v1(path.region, path.page, urlParams.name),
		)
		.handle("get-rankings-2v2", ({ path }) =>
			getRankings2v2(path.region, path.page),
		)
		.handle("get-weekly-rotation", () => getWeeklyRotation())
		.handle("get-preview-articles", () => getPreviewArticles()),
)

const AuthLive = HttpApiBuilder.group(Api, "auth", (handlers) =>
	handlers
		.handle("authorize", ({ path, urlParams }) =>
			authorize(path.provider, urlParams),
		)
		.handle("get_session", () =>
			getSession().pipe(
				Effect.catchTag("DBError", () =>
					Effect.fail(new InternalServerError()),
				),
			),
		)
		.handle("delete_session", () =>
			deleteSession().pipe(
				Effect.catchTag("DBError", () =>
					Effect.fail(new InternalServerError()),
				),
			),
		)
		.handle("logout", () =>
			deleteSession().pipe(
				Effect.catchTag("DBError", () =>
					Effect.fail(new InternalServerError()),
				),
			),
		)
		.handle("callback", ({ path, urlParams }) =>
			providerCallback(path.provider, urlParams.code, urlParams.state),
		),
)

export const ApiLive = HttpApiBuilder.api(Api).pipe(
	Layer.provide(HealthLive),
	Layer.provide(BrawlhallaLive),
	Layer.provide(AuthLive),
)
