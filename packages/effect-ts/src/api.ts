import {
	HttpApi,
	HttpApiBuilder,
	HttpApiEndpoint,
	HttpApiGroup,
	HttpApiSchema,
} from "@effect/platform"
import { Layer, Schema } from "effect"
import * as Archive from "./services/archive"
import * as BrawlhallaApi from "./services/brawlhalla-api"

import { GetPlayerResponse } from './routes/brawlhalla/get-player/schema'
import { getPlayer } from './routes/brawlhalla/get-player/handler'

const idParam = HttpApiSchema.param("id", Schema.NumberFromString)

const Api = HttpApi.make("Api")
	.add(
		HttpApiGroup.make("Brawlhalla").add(
			HttpApiEndpoint.get("getPlayer")`/players/${idParam}`
				.addSuccess(GetPlayerResponse)
				.addError(BrawlhallaApi.BrawlhallaApiError)
				.addError(Archive.ArchiveError),
		),
	)
	.prefix("/brawlhalla")

const BrawlhallaLive = HttpApiBuilder.group(Api, "Brawlhalla", (handlers) =>
	handlers.handle("getPlayer", ({ path }) => getPlayer(path.id)),
)

export const ApiLive = HttpApiBuilder.api(Api).pipe(Layer.provide(BrawlhallaLive))
