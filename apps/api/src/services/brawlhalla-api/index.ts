import { Archive } from "@/services/archive"
import { Fetcher } from "@/services/fetcher"
import { shouldUseFetchFirst } from "@/services/fetch-strategy"
import {
  BrawlhallaApiClientService,
  layerBrawlhallaApiClient,
  PlayerRanked,
  PlayerStats,
  Rankings1v1,
  Rankings2v2,
  RankingsRotating,
  Clan,
  Legends,
  type RankedRegion,
} from "@dair/brawlhalla-api"
import { Config, Context, Effect, Layer, Redacted, Schema, pipe } from "effect"
import { BrawlhallaPlayerNotFound } from "./errors"

type CachedResult<T> = {
  data: T
  updatedAt: Date
  cached: boolean
}

export class BrawlhallaApi extends Context.Service<BrawlhallaApi>()(
  "@dair/services/BrawlhallaApi",
  {
    make: Effect.gen(function* () {
      const client = yield* BrawlhallaApiClientService
      const fetcher = yield* Fetcher
      const archive = yield* Archive

      const cachedCall = <T>({
        cacheName,
        schema,
        fetch,
      }: {
        cacheName: string
        schema: Schema.Schema<T>
        fetch: Effect.Effect<T, unknown, unknown>
      }) =>
        Effect.gen(function* () {
          const useFetchFirst = yield* shouldUseFetchFirst

          if (useFetchFirst) {
            const data = yield* fetch
            return { data, updatedAt: new Date(), cached: false }
          }

          return yield* fetcher.runCacheFirst({ cacheName, schema, fetch })
        })

      return {
        getPlayerStatsById: Effect.fn("getPlayerStatsById")(function* (
          playerId: number,
        ) {
          return yield* cachedCall({
            cacheName: `brawlhalla-player-stats-${playerId}`,
            schema: PlayerStats,
            fetch: client.player.stats({ params: { playerId } }),
          }).pipe(
            Effect.tapError((error) =>
              Effect.logError(
                "Error getting player stats from Brawlhalla API",
                error,
              ),
            ),
            Effect.catch(() =>
              pipe(
                archive.getPlayerHistory(playerId, 1),
                Effect.tapError((error) =>
                  Effect.logError(
                    "Error getting player stats from archive",
                    error,
                  ),
                ),
                Effect.flatMap(
                  Effect.fnUntraced(function* (playerHistory) {
                    const data = playerHistory[0]
                    if (!data) {
                      return yield* Effect.fail(
                        BrawlhallaPlayerNotFound.make({
                          playerId,
                          status: 404,
                        }),
                      )
                    }
                    const rawStatsData = yield* Schema.decodeUnknownEffect(
                      PlayerStats,
                    )(data.rawStatsData)
                    return {
                      data: rawStatsData,
                      updatedAt: data.recordedAt,
                      cached: true,
                    }
                  }),
                ),
                Effect.tap((archiveData) =>
                  Effect.log(
                    "Got player stats from archive",
                    archiveData.data.name,
                  ),
                ),
              ),
            ),
          )
        }),
        getPlayerRankedById: Effect.fn("getPlayerRankedById")(function* (
          playerId: number,
        ) {
          return yield* cachedCall({
            cacheName: `brawlhalla-player-ranked-${playerId}`,
            schema: PlayerRanked,
            fetch: client.player.ranked({ params: { playerId } }),
          }).pipe(
            Effect.tapError((error) =>
              Effect.logError(
                "Error getting player ranked from Brawlhalla API",
                error,
              ),
            ),
            Effect.catch(() =>
              pipe(
                archive.getPlayerHistory(playerId, 1),
                Effect.tapError((error) =>
                  Effect.logError(
                    "Error getting player ranked from archive",
                    error,
                  ),
                ),
                Effect.flatMap(
                  Effect.fnUntraced(function* (playerHistory) {
                    const data = playerHistory[0]
                    if (!data) {
                      return yield* Effect.fail(
                        BrawlhallaPlayerNotFound.make({
                          playerId,
                          status: 404,
                        }),
                      )
                    }
                    const rawRankedData = yield* Schema.decodeUnknownEffect(
                      PlayerRanked,
                    )(data.rawRankedData)
                    return {
                      data: rawRankedData,
                      updatedAt: data.recordedAt,
                      cached: true,
                    }
                  }),
                ),
                Effect.tap((archiveData) =>
                  Effect.log(
                    "Got player ranked from archive",
                    archiveData.data.name,
                  ),
                ),
              ),
            ),
          )
        }),
        getRankings1v1: Effect.fn("getRankings1v1")(function* (
          region: RankedRegion,
          page: number,
          name?: string,
        ) {
          return yield* cachedCall({
            cacheName: `brawlhalla-rankings-1v1-${region}-${page}-${name ?? ""}`,
            schema: Rankings1v1,
            fetch: client.rankings.oneVOne({
              params: { region, page },
              query: name !== undefined ? { name } : {},
            }),
          })
        }),
        getRankings2v2: Effect.fn("getRankings2v2")(function* (
          region: RankedRegion,
          page: number,
        ) {
          return yield* cachedCall({
            cacheName: `brawlhalla-rankings-2v2-${region}-${page}`,
            schema: Rankings2v2,
            fetch: client.rankings.twoVTwo({ params: { region, page } }),
          })
        }),
        getRankingsRotating: Effect.fn("getRankingsRotating")(function* (
          region: RankedRegion,
          page: number,
        ) {
          return yield* cachedCall({
            cacheName: `brawlhalla-rankings-rotating-${region}-${page}`,
            schema: RankingsRotating,
            fetch: client.rankings.rotating({ params: { region, page } }),
          })
        }),
        getClanById: Effect.fn("getClanById")(function* (clanId: number) {
          return yield* cachedCall({
            cacheName: `brawlhalla-clan-${clanId}`,
            schema: Clan,
            fetch: client.clan.get({ params: { clanId } }),
          })
        }),
        getAllLegendsData: Effect.fn("getAllLegendsData")(function* () {
          return yield* cachedCall({
            cacheName: "brawlhalla-legend-all",
            schema: Legends,
            fetch: client.legend.all(),
          })
        }),
      }
    }),
  },
) {
  static readonly layer = Layer.effect(this, this.make).pipe(
    Layer.provide(
      Layer.unwrap(
        Effect.gen(function* () {
          const apiKey = yield* Config.redacted("BRAWLHALLA_API_KEY")
          return layerBrawlhallaApiClient({ apiKey })
        }),
      ),
    ),
    Layer.provide(Fetcher.layer),
    Layer.provide(Archive.layer),
  )
}
