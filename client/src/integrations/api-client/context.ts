import { env } from "@/env"
import { Api } from "@dair/api-contract"
import { AtomHttpApi } from "@effect-atom/atom-react"
import { FetchHttpClient, HttpApiClient } from "@effect/platform"
import { Effect } from "effect"

class ApiClient extends AtomHttpApi.Tag<ApiClient>()("ApiClient", {
	api: Api,
	// Provide a Layer that provides the HttpClient
	httpClient: FetchHttpClient.layer,
	baseUrl: env.VITE_API_URL,
}) {}

export function getContext() {
	return {
		ApiClient: Effect.runSync(
			HttpApiClient.make(Api, {
				baseUrl: env.VITE_API_URL,
			}).pipe(Effect.provide(FetchHttpClient.layer)),
		),
		apiClient: {
			auth: {
				// getSession: apiClient.v1.auth.session.$get,
				// getLoginUrl: (provider: Provider) => {
				//   return apiClient.v1.auth.providers[":provider"].authorize.$get({
				//     param: { provider },
				//     query: {
				//       // TODO: Add redirectTo
				//     },
				//   });
				// },
				// logout: apiClient.v1.auth.session.$delete,
				getSession: () => null,
				getLoginUrl: (provider: Provider) => null,
				logout: () => null,
			},
			checkHealth: () =>
				ApiClient.query("health", "health", { reactivityKeys: ["health"] }),
			brawlhalla: {
				// get1v1Rankings: apiClient.v1.brawlhalla.rankings["1v1"].$get,
				// get2v2Rankings: apiClient.v1.brawlhalla.rankings["2v2"].$get,
				// getClansSearch: apiClient.v1.brawlhalla.clans.search.$get,
				// getClanById: apiClient.v1.brawlhalla.clans[":clanId"].$get,
				// getPowerRankings: apiClient.v1.brawlhalla.rankings.power.$get,
				// searchPlayer: apiClient.v1.brawlhalla.players.search.$get,
				// getPlayerById: apiClient.v1.brawlhalla.players[":playerId"].$get,
				// getArticles: apiClient.v1.brawlhalla.articles.$get,
				// getWeeklyRotation: apiClient.v1.brawlhalla["weekly-rotation"].$get,
				getPlayerById: (id: number) =>
					ApiClient.query("brawlhalla", "get-player-by-id", {
						reactivityKeys: ["brawlhalla-player-id"],
						path: {
							id,
						},
					}),
			},
			bookmarks: {
				getBookmarkByPageId: (pageType: PageType, pageId: string) => null,
				addBookmark: (pageType: PageType, pageId: string) => null,
				deleteBookmark: (pageType: PageType, pageId: string) => null,
				getBookmarks: () => null,
				// getBookmarkByPageId:
				//   apiClient.v1.bookmarks[":pageType"][":pageId"].$get,
				// addBookmark: apiClient.v1.bookmarks[":pageType"][":pageId"].$put,
				// deleteBookmark: apiClient.v1.bookmarks[":pageType"][":pageId"].$delete,
				// getBookmarks: apiClient.v1.bookmarks.$get,
			},
		},
	}
}

export type Context = ReturnType<typeof getContext>
