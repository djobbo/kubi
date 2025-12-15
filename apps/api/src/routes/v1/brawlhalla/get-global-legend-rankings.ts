import { Effect } from "effect"
import { Archive } from "@/services/archive"
import type {
  GetGlobalLegendRankingsResponse,
  GlobalLegendRankingsSortByParam,
  LegendRanking,
} from "@dair/api-contract/src/routes/v1/brawlhalla/get-global-legend-rankings"
import { getEntitySlug } from "@/helpers/entity-slug"

export const getGlobalLegendRankings = Effect.fn("getGlobalLegendRankings")(
  function* (
    legendId: number,
    sortBy: typeof GlobalLegendRankingsSortByParam.Type,
  ) {
    const archive = yield* Archive
    const rankings = yield* archive.getGlobalLegendRankings(legendId, sortBy)

    const rankingsData = rankings.map<typeof LegendRanking.Type>((ranking) => ({
      ...ranking,
      playerSlug: getEntitySlug(ranking.playerId, ranking.playerName),
    }))

    const response: typeof GetGlobalLegendRankingsResponse.Type = {
      data: rankingsData,
      meta: {},
    }

    return response
  },
)
