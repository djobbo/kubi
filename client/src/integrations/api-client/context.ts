import { env } from "@/env"
import type { App } from "@dair/api"
import type { Provider } from "@dair/schema/src/auth/oauth-accounts"
import { hc } from "hono/client"

const apiClient = hc<App>(env.VITE_API_URL)

export function getContext() {
	return {
		apiClient: {
			auth: {
				getSession: apiClient.v1.auth.session.$get,
				getLoginUrl: (provider: Provider) => {
					return apiClient.v1.auth.providers[":provider"].authorize.$get({
						param: { provider },
						query: {
							// TODO: Add redirectTo
						},
					})
				},
				logout: apiClient.v1.auth.session.$delete,
			},
			checkHealth: apiClient.health.$get,
			brawlhalla: {
				get1v1Rankings: apiClient.v1.brawlhalla.rankings["1v1"].$get,
				get2v2Rankings: apiClient.v1.brawlhalla.rankings["2v2"].$get,
				getClansSearch: apiClient.v1.brawlhalla.clans.search.$get,
				getClanById: apiClient.v1.brawlhalla.clans[":clanId"].$get,
				getPowerRankings: apiClient.v1.brawlhalla.rankings.power.$get,
				searchPlayer: apiClient.v1.brawlhalla.players.search.$get,
				getPlayerById: apiClient.v1.brawlhalla.players[":playerId"].$get,
				getArticles: apiClient.v1.brawlhalla.articles.$get,
				getWeeklyRotation: apiClient.v1.brawlhalla["weekly-rotation"].$get,
			},
			bookmarks: {
				getBookmarkByPageId:
					apiClient.v1.bookmarks[":pageType"][":pageId"].$get,
				addBookmark: apiClient.v1.bookmarks[":pageType"][":pageId"].$put,
				deleteBookmark: apiClient.v1.bookmarks[":pageType"][":pageId"].$delete,
				getBookmarks: apiClient.v1.bookmarks.$get,
			},
		},
	}
}

export type Context = ReturnType<typeof getContext>
