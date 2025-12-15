import { Effect } from "effect"
import { Archive } from "../../../services/archive"
import type {
  GetPlayerRankingsResponse,
  GlobalPlayerRankingsSortByParam,
  PlayerRanking,
} from "@dair/api-contract/src/routes/v1/brawlhalla/get-player-rankings"
import { getEntitySlug } from "@/helpers/entity-slug"

export const getPlayerRankings = Effect.fn("getPlayerRankings")(function* (
  sortBy: typeof GlobalPlayerRankingsSortByParam.Type,
) {
  const archive = yield* Archive
  const rankings = yield* archive.getPlayerRankings(sortBy)

  const rankingsData = rankings.map<typeof PlayerRanking.Type>((ranking) => ({
    ...ranking,
    slug: getEntitySlug(ranking.playerId, ranking.name),
  }))

  const response: typeof GetPlayerRankingsResponse.Type = {
    data: rankingsData,
    meta: {},
  }

  return response
})
