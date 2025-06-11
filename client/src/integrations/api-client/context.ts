import { env } from '@/env'
import type { App } from "@dair/api"
import { hc } from "hono/client"

const apiClient = hc<App>(env.VITE_API_URL)

export function getContext() {
	return {
		apiClient: {
			brawlhalla: {
				get1v1Rankings: apiClient.v1.brawlhalla.rankings["1v1"][":region?"][":page?"].$get,
				get2v2Rankings: apiClient.v1.brawlhalla.rankings["2v2"][":region?"][":page?"].$get,
				getClansSearch: apiClient.v1.brawlhalla.clans.search[":page?"].$get,
				getClan: apiClient.v1.brawlhalla.clans[":clanId"].$get,
				getPowerRankings: apiClient.v1.brawlhalla.rankings.power[':region?'][':page?'].$get,
				searchPlayer: apiClient.v1.brawlhalla.players.search.$get,
			}
		},
	}
}

export type Context = ReturnType<typeof getContext>
