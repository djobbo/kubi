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
					return apiClient.v1.auth.login[":provider"].$url({
						param: { provider },
					})
				},
				logout: apiClient.v1.auth.logout.$post,
			},
			brawlhalla: {
				get1v1Rankings:
					apiClient.v1.brawlhalla.rankings["1v1"][":region?"][":page?"].$get,
				get2v2Rankings:
					apiClient.v1.brawlhalla.rankings["2v2"][":region?"][":page?"].$get,
				getClansSearch: apiClient.v1.brawlhalla.clans.search[":page?"].$get,
				getClanById: apiClient.v1.brawlhalla.clans[":clanId"].$get,
				getPowerRankings:
					apiClient.v1.brawlhalla.rankings.power[":region?"][":page?"].$get,
				searchPlayer: apiClient.v1.brawlhalla.players.search.$get,
				getPlayerById: apiClient.v1.brawlhalla.players[":playerId"].$get,
				getArticles: apiClient.v1.brawlhalla.articles[":category?"].$get,
				getWeeklyRotation: apiClient.v1.brawlhalla["weekly-rotation"].$get,
			},
			bookmarks: {
				getBookmarkByPageId:
					apiClient.v1.bookmarks[":pageType"][":pageId"].$get,
				addBookmark: apiClient.v1.bookmarks[":pageType"][":pageId"].$post,
				deleteBookmark: apiClient.v1.bookmarks[":pageType"][":pageId"].$delete,
				getBookmarks: apiClient.v1.bookmarks.$get,
			},
		},
	}
}

export type Context = ReturnType<typeof getContext>
