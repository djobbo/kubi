import { env } from "@/env"
import { typesafeFetch } from "@/helpers/typesafe-fetch"
import { withCache } from "@/helpers/with-cache"
import { powerRankingsSchema } from "@dair/brawlhalla-api/src/api/schema/power-rankings"
import {
  type PowerRankedGameMode,
  PowerRankingsGameMode,
  powerRankedGameModeMap,
} from "@dair/brawlhalla-api/src/constants/power/game-mode"
import {
  PowerRankingsOrder,
  PowerRankingsOrderBy,
} from "@dair/brawlhalla-api/src/constants/power/order-by"
import { PowerRankingsRegion } from "@dair/brawlhalla-api/src/constants/power/regions"
import { powerRankingsMock } from "./mocks"

const BRAWLTOOLS_API_URL = "https://api.brawltools.com"
const MAX_RESULTS = 50

const fetchBrawltoolsApi = typesafeFetch("Brawltools API", BRAWLTOOLS_API_URL)

const DEFAULT_REGION: PowerRankingsRegion = PowerRankingsRegion.NA
const DEFAULT_PAGE = 1
const DEFAULT_ORDER_BY: PowerRankingsOrderBy = PowerRankingsOrderBy.PowerRank
const DEFAULT_ORDER: PowerRankingsOrder = PowerRankingsOrder.Desc
const DEFAULT_GAME_MODE: PowerRankedGameMode = PowerRankingsGameMode.Power1v1

export const brawltoolsService = {
  getPowerRankings: async ({
    region = DEFAULT_REGION,
    page = DEFAULT_PAGE,
    orderBy = DEFAULT_ORDER_BY,
    order = DEFAULT_ORDER,
    gameMode = DEFAULT_GAME_MODE,
    search = "",
  }: {
    region?: string
    page?: number
    orderBy?: PowerRankingsOrderBy
    order?: PowerRankingsOrder
    gameMode?: PowerRankedGameMode
    search?: string
  }) => {
    const fetchPowerRankings = async () => {
      const data = await fetchBrawltoolsApi(
        {
          path: "/pr",
          schema: powerRankingsSchema,
          mock: powerRankingsMock,
        },
        {
          body: JSON.stringify({
            gameMode: powerRankedGameModeMap[gameMode],
            orderBy: `${orderBy} ${order}`,
            page,
            region,
            query: search || null,
            maxResults: MAX_RESULTS,
          }),
          method: "POST",
        },
      )

      return data
    }

    const { data: rankings, updatedAt } = await withCache(
      `brawlhalla-power-rankings-${gameMode}-${region}-${page}-${orderBy}-${order}-${search}`,
      fetchPowerRankings,
      env.CACHE_MAX_AGE_OVERRIDE ?? (search ? 5 * 60 * 1000 : 60 * 60 * 1000),
    )

    return {
      rankings,
      page,
      gameMode,
      region,
      orderBy,
      order,
      updatedAt,
      search,
    }
  },
}
