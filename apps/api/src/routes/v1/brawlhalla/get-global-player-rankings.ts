import { Effect } from "effect"
import { Archive } from "@/services/archive"
import type {
  GetGlobalPlayerRankingsResponse,
  GlobalPlayerRankingsSortByParam,
  PlayerRanking,
} from "@dair/api-contract/src/routes/v1/brawlhalla/get-global-player-rankings"
import { getEntitySlug } from "@/helpers/entity-slug"

export const getGlobalPlayerRankings = Effect.fn("getGlobalPlayerRankings")(
  function* (sortBy: typeof GlobalPlayerRankingsSortByParam.Type) {
    const archive = yield* Archive
    const rankings = yield* archive.getGlobalPlayerRankings(sortBy)

    const rankingsData = rankings.map<typeof PlayerRanking.Type>((ranking) => ({
      ...ranking,
      slug: getEntitySlug(ranking.playerId, ranking.name),
    }))

    const response: typeof GetGlobalPlayerRankingsResponse.Type = {
      data: rankingsData,
      meta: {},
    }

    return response
  },
)
