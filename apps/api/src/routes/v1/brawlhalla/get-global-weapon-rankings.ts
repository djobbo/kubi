import { Effect } from "effect"
import { Archive } from "@/services/archive"
import type {
  GetGlobalWeaponRankingsResponse,
  GlobalWeaponRankingsSortByParam,
  WeaponRanking,
} from "@dair/api-contract/src/routes/v1/brawlhalla/get-global-weapon-rankings"
import { getEntitySlug } from "@/helpers/entity-slug"

export const getGlobalWeaponRankings = Effect.fn("getGlobalWeaponRankings")(
  function* (
    weaponName: string,
    sortBy: typeof GlobalWeaponRankingsSortByParam.Type,
  ) {
    const archive = yield* Archive
    const rankings = yield* archive.getGlobalWeaponRankings(weaponName, sortBy)

    const rankingsData = rankings.map<typeof WeaponRanking.Type>((ranking) => ({
      ...ranking,
      playerSlug: getEntitySlug(ranking.playerId, ranking.playerName),
    }))

    const response: typeof GetGlobalWeaponRankingsResponse.Type = {
      data: rankingsData,
      meta: {},
    }

    return response
  },
)
