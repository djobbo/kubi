import { Effect } from "effect"
import { BrawltoolsApi } from "@/services/brawltools-api"
import type {
  GetPowerRankingsResponse,
  PowerRankingsGameMode,
  PowerRankingsOrderBy,
  PowerRankingsOrder,
  PowerRankingsRegion,
} from "@dair/api-contract/src/routes/v1/brawlhalla/get-power-rankings"

export const getPowerRankings = Effect.fn("getPowerRankings")(function* ({
  region,
  page = 1,
  orderBy = "powerRanking",
  gameMode = "1v1",
}: {
  region: PowerRankingsRegion
  page?: number
  orderBy?: PowerRankingsOrderBy
  gameMode?: PowerRankingsGameMode
}) {
  const brawltoolsApi = yield* BrawltoolsApi
  yield* Effect.log(
    `Fetching power rankings: ${gameMode} ${region ?? "all"} page ${page}`,
  )

  const result = yield* brawltoolsApi.getPowerRankings({
    region,
    page,
    orderBy,
    gameMode,
  })

  const response: typeof GetPowerRankingsResponse.Type = {
    data: result.rankings.prPlayers.map((player) => ({
      playerId: player.playerId,
      playerName: player.playerName,
      twitter: player.twitter,
      twitch: player.twitch,
      top8: player.top8,
      top32: player.top32,
      gold: player.gold,
      silver: player.silver,
      bronze: player.bronze,
      powerRanking: player.powerRanking,
      points: player.points,
      earnings: player.earnings,
    })),
    meta: {
      page: result.page,
      totalPages: result.rankings.totalPages,
      region: result.region,
      gameMode: result.gameMode,
      orderBy: result.orderBy,
      order: result.order,
      lastUpdated: result.rankings.lastUpdated,
      timestamp: new Date(),
    },
  }

  return response
})
