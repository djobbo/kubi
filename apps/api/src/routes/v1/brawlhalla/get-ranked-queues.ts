import { Archive } from "@/services/archive"
import { Effect } from "effect"
import type {
  GetRankedQueues1v1Response,
  GetRankedQueues2v2Response,
  GetRankedQueuesRotatingResponse,
} from "@dair/api-contract/src/routes/v1/brawlhalla/get-ranked-queues"
import { getEntitySlug } from "@/helpers/entity-slug"
import type { AnyRegion } from "@dair/api-contract/src/shared/region"

const WINDOW_MINUTES = 15

export const getRanked1v1Queue = Effect.fn("getRanked1v1Queue")(function* (
  region: typeof AnyRegion.Type,
) {
  const archive = yield* Archive

  const activePlayers = yield* archive.getRecentlyActiveRanked1v1Players({
    windowMinutes: WINDOW_MINUTES,
    region,
  })

  const response: typeof GetRankedQueues1v1Response.Type = {
    data: activePlayers.map((player) => ({
      playerId: player.playerId,
      name: player.name,
      slug: getEntitySlug(player.playerId, player.name),
      rating: player.rating,
      peakRating: player.peakRating,
      games: player.games,
      wins: player.wins,
      tier: player.tier,
      region: player.region,
      gamesDelta: player.gamesDelta,
      lastSeenAt: player.lastSeenAt,
    })),
    meta: {
      queueType: "1v1",
      windowMinutes: WINDOW_MINUTES,
    },
  }

  return response
})

export const getRanked2v2Queue = Effect.fn("getRanked2v2Queue")(function* (
  region: typeof AnyRegion.Type,
) {
  const archive = yield* Archive

  const activePlayers = yield* archive.getRecentlyActiveRanked2v2Players({
    windowMinutes: WINDOW_MINUTES,
    region,
  })

  const response: typeof GetRankedQueues2v2Response.Type = {
    data: activePlayers.map((player) => ({
      players: [
        {
          playerId: player.playerIdOne,
          name: player.playerNameOne,
          slug: getEntitySlug(player.playerIdOne, player.playerNameOne),
        },
        {
          playerId: player.playerIdTwo,
          name: player.playerNameTwo,
          slug: getEntitySlug(player.playerIdTwo, player.playerNameTwo),
        },
      ],
      rating: player.rating,
      peakRating: player.peakRating,
      games: player.games,
      wins: player.wins,
      tier: player.tier,
      region: player.region,
      gamesDelta: player.gamesDelta,
      lastSeenAt: player.lastSeenAt,
    })),
    meta: {
      queueType: "2v2",
      windowMinutes: WINDOW_MINUTES,
    },
  }

  return response
})

export const getRankedRotatingQueue = Effect.fn("getRankedRotatingQueue")(
  function* (region: typeof AnyRegion.Type) {
    const archive = yield* Archive

    const activePlayers = yield* archive.getRecentlyActiveRankedRotatingPlayers(
      {
        windowMinutes: WINDOW_MINUTES,
        region,
      },
    )

    const response: typeof GetRankedQueuesRotatingResponse.Type = {
      data: activePlayers.map((player) => ({
        playerId: player.playerId,
        name: player.name,
        slug: getEntitySlug(player.playerId, player.name),
        rating: player.rating,
        peakRating: player.peakRating,
        games: player.games,
        wins: player.wins,
        tier: player.tier,
        region: player.region,
        gamesDelta: player.gamesDelta,
        lastSeenAt: player.lastSeenAt,
      })),
      meta: {
        queueType: "rotating",
        windowMinutes: WINDOW_MINUTES,
      },
    }

    return response
  },
)
