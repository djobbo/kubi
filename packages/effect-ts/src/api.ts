import {
	FetchHttpClient,
	HttpApi,
	HttpApiBuilder,
	HttpApiClient,
	HttpApiEndpoint,
	HttpApiGroup,
	HttpApiSchema,
} from "@effect/platform"
import { Effect, Layer, Schema } from "effect"
import * as Archive from "./services/archive"
import * as BrawlhallaApi from "./services/brawlhalla-api"

import { providers } from "@dair/schema"
import { BadRequest, Unauthorized } from "@effect/platform/HttpApiError"
import { deleteSession } from "./routes/auth/deleteSession/handler"
import { DeleteSessionResponse } from "./routes/auth/deleteSession/schema"
import { getSession } from "./routes/auth/getSession/handler"
import { GetSessionResponse } from "./routes/auth/getSession/schema"
import { authorize } from "./routes/auth/providers/authorize/handler"
import {
	State,
	providerCallback,
} from "./routes/auth/providers/callback/handler"
import { getPlayer } from "./routes/brawlhalla/get-player/handler"
import { GetPlayerResponse } from "./routes/brawlhalla/get-player/schema"
import { DBError } from "./services/db"

const idParam = HttpApiSchema.param("id", Schema.NumberFromString)
const providerParam = HttpApiSchema.param(
	"provider",
	Schema.Literal(...providers),
)

export const Api = HttpApi.make("Api")
	.add(
		HttpApiGroup.make("Brawlhalla")
			.add(
				HttpApiEndpoint.get("getPlayer")`/players/${idParam}`
					.addSuccess(GetPlayerResponse)
					.addError(BrawlhallaApi.BrawlhallaApiError)
					.addError(Archive.ArchiveError)
					.addError(DBError),
			)
			.prefix("/brawlhalla"),
	)
	.add(
		HttpApiGroup.make("Auth")
			.add(
				HttpApiEndpoint.get("get_session")`/session`
					.addSuccess(GetSessionResponse)
					.addError(DBError)
					.addError(Unauthorized),
			)
			.add(
				HttpApiEndpoint.del("delete_session")`/session`
					.addSuccess(DeleteSessionResponse)
					.addError(DBError)
					.addError(Unauthorized),
			)
			.add(
				HttpApiEndpoint.get("logout")`/logout`
					.addSuccess(DeleteSessionResponse)
					.addError(DBError)
					.addError(Unauthorized),
			)
			.add(
				HttpApiEndpoint.get("authorize")`/providers/${providerParam}/authorize`
					.setUrlParams(State)
					.addError(DBError)
					.addError(Unauthorized),
			)
			.add(
				HttpApiEndpoint.get("callback")`/providers/${providerParam}/callback`
					.setUrlParams(
						Schema.Struct({
							code: Schema.String,
							state: Schema.String,
						}),
					)
					.addSuccess(Schema.Struct({}))
					.addError(Unauthorized)
					.addError(BadRequest)
					.addError(DBError),
			)
			.prefix("/auth"),
	)
	.prefix("/v1")

const BrawlhallaLive = HttpApiBuilder.group(Api, "Brawlhalla", (handlers) =>
	handlers.handle("getPlayer", ({ path }) => getPlayer(path.id)),
)

const AuthLive = HttpApiBuilder.group(Api, "Auth", (handlers) =>
	handlers
		.handle("authorize", ({ path, urlParams }) =>
			authorize(path.provider, urlParams),
		)
		.handle("get_session", () => getSession())
		.handle("delete_session", () => deleteSession())
		.handle("logout", () => deleteSession())
		.handle("callback", ({ path, urlParams }) => {
			return providerCallback(path.provider, urlParams.code, urlParams.state)
		}),
)

export const ApiLive = HttpApiBuilder.api(Api).pipe(
	Layer.provide(BrawlhallaLive),
	Layer.provide(AuthLive),
)

// const program = Effect.gen(function* () {
// 	const client = yield* HttpApiClient.make(Api, {
// 	  baseUrl: "http://localhost:3000"
// 	})

// 	const hello = yield* client.Auth.delete_session()
// 	console.log(hello)
//   })

// Effect.runPromise(program.pipe(
// 	Effect.provide(FetchHttpClient.layer),
// ))
