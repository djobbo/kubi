import { Effect } from "effect"
import { Archive } from "@/services/archive"
import type {
  GetGlobalLegendRankingsResponse,
  GlobalLegendRankingsOrderBy,
  LegendRanking,
} from "@dair/api-contract/src/routes/v1/brawlhalla/get-legend-rankings"
import { getEntitySlug } from "@/helpers/entity-slug"

export const getGlobalLegendRankings = Effect.fn("getGlobalLegendRankings")(
  function* (
    legendId: number,
    orderBy: typeof GlobalLegendRankingsOrderBy.Type,
  ) {
    const archive = yield* Archive
    const rankings = yield* archive.getGlobalLegendRankings(legendId, orderBy)

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
