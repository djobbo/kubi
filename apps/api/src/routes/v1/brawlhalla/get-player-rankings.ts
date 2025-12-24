import { Effect } from "effect"
import { Archive } from "@/services/archive"
import type {
  GetGlobalPlayerRankingsResponse,
  GlobalPlayerRankingsOrderBy,
  PlayerRanking,
} from "@dair/api-contract/src/routes/v1/brawlhalla/get-player-rankings"
import { getEntitySlug } from "@/helpers/entity-slug"

export const getGlobalPlayerRankings = Effect.fn("getGlobalPlayerRankings")(
  function* (orderBy: typeof GlobalPlayerRankingsOrderBy.Type) {
    const archive = yield* Archive
    const rankings = yield* archive.getGlobalPlayerRankings(orderBy)

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
