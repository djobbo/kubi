import { Effect } from "effect"
import { Archive } from "@/services/archive"
import type {
  GetGlobalWeaponRankingsResponse,
  GlobalWeaponRankingsOrderBy,
  WeaponRanking,
} from "@dair/api-contract/src/routes/v1/brawlhalla/get-weapon-rankings"
import { getEntitySlug } from "@/helpers/entity-slug"

export const getGlobalWeaponRankings = Effect.fn("getGlobalWeaponRankings")(
  function* (
    weaponName: string,
    orderBy: typeof GlobalWeaponRankingsOrderBy.Type,
  ) {
    const archive = yield* Archive
    const rankings = yield* archive.getGlobalWeaponRankings(weaponName, orderBy)

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
