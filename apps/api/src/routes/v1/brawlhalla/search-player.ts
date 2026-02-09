import { Effect, Duration } from "effect"
import { Archive } from "@/services/archive"
import type {
  SearchPlayerResponse,
  SearchPlayerItem,
} from "@dair/api-contract/src/routes/v1/brawlhalla/search-player"
import { getEntitySlug } from "@/helpers/entity-slug"
import { getRankings1v1 } from "./get-rankings"

export const searchPlayer = Effect.fn("searchPlayer")(function* (name: string) {
  const archive = yield* Archive
  yield* Effect.log(`Searching for player: ${name}`)
  yield* getRankings1v1("all", 1, name).pipe(
    Effect.tap((rankings) => Effect.log(JSON.stringify(rankings, null, 2))),
    Effect.timeout(Duration.seconds(1)),
    Effect.catchAll(() => Effect.succeed(null)),
    Effect.fork,
  )

  const searchResult = yield* archive
    .searchPlayers(name)
    .pipe(Effect.catchAll(() => Effect.succeed({ data: [], nextCursor: null })))

  Effect.log(searchResult)

  const parsedAliases = searchResult.data.map<typeof SearchPlayerItem.Type>(
    (alias) => {
      // const ranking = alias.playerHistory[0]?.ranked1v1Rating
      //   ? {
      //       rating: alias.playerHistory[0]?.ranked1v1Rating,
      //       peakRating: alias.playerHistory[0]?.ranked1v1PeakRating,
      //       tier: alias.playerHistory[0]?.tier,
      //       region: alias.playerHistory[0]?.region,
      //     }
      //   : null
      // const legend = alias.playerHistory[0]?.legendHistory[0]
      //   ? {
      //       id: alias.playerHistory[0]?.legendHistory[0]?.legendId,
      //     }
      //   : null
      return {
        id: alias.id,
        playerId: alias.playerId,
        slug: getEntitySlug(alias.playerId, alias.name),
        name: alias.name,
        public: alias.public,
        recordedAt: alias.recordedAt,
        // TODO: Add ranking and legend
        ranking: null, // ranking,
        legend: null, // legend,
      }
    },
  )

  const response: typeof SearchPlayerResponse.Type = {
    data: parsedAliases,
    meta: {
      nextCursor: searchResult.nextCursor,
      query: name,
      timestamp: new Date(),
    },
  }

  return response
})
