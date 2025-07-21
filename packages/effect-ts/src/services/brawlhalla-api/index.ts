import { Config, Context, Effect, Layer, Schema } from "effect"
import * as Fetcher from "../../helpers/fetcher"
import { BrawlhallaApiClan } from "./schema/clan"
import { BrawlhallaApiLegends } from "./schema/legends"
import { BrawlhallaApiPlayerRanked } from "./schema/player-ranked"
import { BrawlhallaApiPlayerStats } from "./schema/player-stats"

const BASE_URL = "https://api.brawlhalla.com"

export class BrawlhallaApiError extends Schema.TaggedError<BrawlhallaApiError>(
	"BrawlhallaApiError",
)("BrawlhallaApiError", {
	cause: Schema.optional(Schema.Unknown),
	message: Schema.optional(Schema.String),
}) {}

const fetchBrawlhallaApi = <T, U>(
	name: string,
	schema: Schema.Schema<T, U>,
	path: string,
	searchParams: Record<string, string>,
	cacheName: string,
	init: RequestInit = {},
) => {
	const url = new URL(path, BASE_URL)
	for (const [key, value] of Object.entries(searchParams)) {
		url.searchParams.set(key, value)
	}

	return {
		fetch: () =>
			Effect.gen(function* () {
				const fetcher = yield* Fetcher.Fetcher
				const response = yield* fetcher.fetchRevalidate(
					schema,
					url.toString(),
					{
						init,
						cacheName,
					},
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
			),
		fetchCache: () =>
			Effect.gen(function* () {
				const fetcher = yield* Fetcher.Fetcher
				const response = yield* fetcher.fetchCache(schema, cacheName)
				return response
			}),
	}
}

const brawlhallaApi = (options: BrawlhallaApiOptions) => ({
	playerStatsById: (playerId: number) =>
		fetchBrawlhallaApi(
			"getPlayerStatsById",
			BrawlhallaApiPlayerStats,
			`/player/${playerId}/stats`,
			{
				api_key: options.apiKey,
			},
			`brawlhalla-player-stats-${playerId}`,
		),
	playerRankedById: (playerId: number) =>
		fetchBrawlhallaApi(
			"getPlayerRankedById",
			BrawlhallaApiPlayerRanked,
			`/player/${playerId}/ranked`,
			{
				api_key: options.apiKey,
			},
			`brawlhalla-player-ranked-${playerId}`,
		),
	clanById: (clanId: number) =>
		fetchBrawlhallaApi(
			"getClanById",
			BrawlhallaApiClan,
			`/clan/${clanId}`,
			{
				api_key: options.apiKey,
			},
			`brawlhalla-clan-${clanId}`,
		),
	allLegendsData: () =>
		fetchBrawlhallaApi(
			"getAllLegendsData",
			BrawlhallaApiLegends,
			"/legend/all",
			{
				api_key: options.apiKey,
			},
			"brawlhalla-legend-all",
		),
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
