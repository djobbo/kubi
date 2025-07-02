import { Config, Context, Data, Effect, Layer, type Schema } from "effect"
import * as Fetcher from "../../helpers/fetcher"
import { BrawlhallaApiClan } from "./schema/clan"
import { BrawlhallaApiPlayerRanked } from "./schema/player-ranked"
import { BrawlhallaApiPlayerStats } from "./schema/player-stats"

const BASE_URL = "https://api.brawlhalla.com"

export class BrawlhallaApiError extends Data.TaggedError("BrawlhallaApiError")<{
	cause?: unknown
	message?: string
}> {}

const fetchBrawlhallaApi = <T, U>(
	name: string,
	schema: Schema.Schema<T, U>,
	path: string,
	searchParams: Record<string, string>,
	options: RequestInit = {},
) => {
	const url = new URL(path, BASE_URL)
	for (const [key, value] of Object.entries(searchParams)) {
		url.searchParams.set(key, value)
	}

	return Effect.gen(function* () {
		const fetcher = yield* Fetcher.Fetcher
		const response = yield* fetcher.fetchRevalidate(
			schema,
			url.toString(),
			options,
		)
		return response
	}).pipe(
		Effect.mapError(
			(error) =>
				new BrawlhallaApiError({
					cause: error,
					message: `Failed to fetch ${name}`,
				}),
		),
		Effect.withLogSpan(`BrawlhallaApi.${name}`),
	)
}

const brawlhallaApi = (options: BrawlhallaApiOptions) => ({
	getPlayerStatsById: (playerId: string) =>
		fetchBrawlhallaApi(
			"getPlayerStatsById",
			BrawlhallaApiPlayerStats,
			`/player/${playerId}/stats`,
			{
				api_key: options.apiKey,
			},
		),
	getPlayerRankedById: (playerId: string) =>
		fetchBrawlhallaApi(
			"getPlayerRankedById",
			BrawlhallaApiPlayerRanked,
			`/player/${playerId}/ranked`,
			{
				api_key: options.apiKey,
			},
		),
	getClanById: (clanId: string) =>
		fetchBrawlhallaApi("getClanById", BrawlhallaApiClan, `/clan/${clanId}`, {
			api_key: options.apiKey,
		}),
})

export class BrawlhallaApi extends Context.Tag("BrawlhallaApi")<
	BrawlhallaApi,
	ReturnType<typeof brawlhallaApi>
>() {}

interface BrawlhallaApiOptions {
	apiKey: string
}

export const make = (options: BrawlhallaApiOptions) => {
	const api = brawlhallaApi(options)
	return Effect.succeed(BrawlhallaApi.of(api))
}

export const layer = (options: BrawlhallaApiOptions) => {
	return Layer.scoped(BrawlhallaApi, make(options))
}

export const fromEnv = Layer.scoped(
	BrawlhallaApi,
	Effect.gen(function* () {
		const client = yield* make({
			apiKey: yield* Config.string("BRAWLHALLA_API_KEY"),
		})
		return client
	}),
)
