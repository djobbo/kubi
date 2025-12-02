import { BrawlhallaApiConfig } from "./config"
import { Fetcher } from "@/services/fetcher"
import {
  BrawlhallaApiError,
  BrawlhallaClanNotFound,
  BrawlhallaPlayerNotFound,
  BrawlhallaRateLimitError,
} from "./errors"
import { Context, Effect, Layer, Redacted, type Schema } from "effect"
import { BrawlhallaApiClan } from "./schema/clan"
import { BrawlhallaApiLegends } from "./schema/legends"
import { BrawlhallaApiPlayerRanked } from "./schema/player-ranked"
import { BrawlhallaApiPlayerStats } from "./schema/player-stats"
import {
  BrawlhallaApiRankings1v1,
  BrawlhallaApiRankings2v2,
} from "./schema/rankings"
import { NotFound } from "@effect/platform/HttpApiError"

const BASE_URL = "https://api.brawlhalla.com"

type FetchBrawlhallaApiOptions<T, U> = {
  name: string
  schema: Schema.Schema<T, U>
  path: string
  searchParams?: Record<string, string>
  cacheName: string
}

/**
 * BrawlhallaApi service for interacting with the Brawlhalla API
 */
export class BrawlhallaApi extends Context.Tag("@app/BrawlhallaApi")<
  BrawlhallaApi,
  {
    readonly getPlayerStatsById: (playerId: number) => Effect.Effect<
      {
        data: typeof BrawlhallaApiPlayerStats.Type
        updatedAt: Date
        cached: boolean
      },
      BrawlhallaApiError | BrawlhallaPlayerNotFound | BrawlhallaRateLimitError
    >
    readonly getPlayerRankedById: (playerId: number) => Effect.Effect<
      {
        data: typeof BrawlhallaApiPlayerRanked.Type
        updatedAt: Date
        cached: boolean
      },
      BrawlhallaApiError | BrawlhallaPlayerNotFound | BrawlhallaRateLimitError
    >
    readonly getRankings1v1: (
      region: string,
      page: number,
      name?: string,
    ) => Effect.Effect<
      {
        data: typeof BrawlhallaApiRankings1v1.Type
        updatedAt: Date
        cached: boolean
      },
      BrawlhallaApiError | BrawlhallaRateLimitError | NotFound
    >
    readonly getRankings2v2: (
      region: string,
      page: number,
    ) => Effect.Effect<
      {
        data: typeof BrawlhallaApiRankings2v2.Type
        updatedAt: Date
        cached: boolean
      },
      BrawlhallaApiError | BrawlhallaRateLimitError | NotFound
    >
    readonly getClanById: (
      clanId: number,
    ) => Effect.Effect<
      { data: typeof BrawlhallaApiClan.Type; updatedAt: Date; cached: boolean },
      BrawlhallaApiError | BrawlhallaClanNotFound | BrawlhallaRateLimitError
    >
    readonly getAllLegendsData: () => Effect.Effect<
      {
        data: typeof BrawlhallaApiLegends.Type
        updatedAt: Date
        cached: boolean
      },
      BrawlhallaApiError | BrawlhallaRateLimitError | NotFound
    >
  }
>() {
  /**
   * Live layer for BrawlhallaApi service
   */
  static readonly layer = Layer.effect(
    BrawlhallaApi,
    Effect.gen(function* () {
      const config = yield* BrawlhallaApiConfig
      const fetcher = yield* Fetcher
      const apiKey = Redacted.value(config.apiKey)

      /**
       * Helper function to fetch data from Brawlhalla API with error handling
       */
      const fetchApi = <T, U>({
        name,
        schema,
        path,
        searchParams = {},
        cacheName,
      }: FetchBrawlhallaApiOptions<T, U>) =>
        Effect.gen(function* () {
          const url = new URL(path, BASE_URL)
          for (const [key, value] of Object.entries(searchParams)) {
            url.searchParams.set(key, value)
          }
          url.searchParams.set("api_key", apiKey)

          return yield* fetcher.fetchRevalidate(schema, {
            method: "GET",
            url: url.toString(),
            cacheName,
          })
        }).pipe(
          Effect.withSpan(`BrawlhallaApi.${name}`),
          Effect.catchTags({
            ResponseError: (error) =>
              Effect.gen(function* () {
                switch (error.response.status) {
                  case 404:
                    return yield* Effect.fail(new NotFound())
                  case 429:
                    return yield* Effect.fail(
                      new BrawlhallaRateLimitError({
                        message:
                          "Rate limit exceeded for Brawlhalla API. Please try again later.",
                      }),
                    )
                  default:
                    return yield* Effect.fail(
                      new BrawlhallaApiError({
                        cause: error,
                        message: `Brawlhalla API request failed with status ${error.response.status}`,
                        status: error.response.status,
                      }),
                    )
                }
              }),
            HttpBodyError: (error) =>
              Effect.fail(
                new BrawlhallaApiError({
                  cause: error,
                  message: "Failed to parse Brawlhalla API response",
                }),
              ),
            ParseError: (error) =>
              Effect.fail(
                new BrawlhallaApiError({
                  cause: error,
                  message: "Failed to parse Brawlhalla API response",
                }),
              ),
            RequestError: (error) =>
              Effect.fail(
                new BrawlhallaApiError({
                  cause: error,
                  message: "Failed to make request to Brawlhalla API",
                }),
              ),
            TimeoutException: (error) =>
              Effect.fail(
                new BrawlhallaApiError({
                  cause: error,
                  message: "Brawlhalla API request timed out",
                }),
              ),
          }),
        )

      const service = {
        getPlayerStatsById: (playerId: number) =>
          fetchApi({
            name: "getPlayerStatsById",
            schema: BrawlhallaApiPlayerStats,
            path: `/player/${playerId}/stats`,
            cacheName: `brawlhalla-player-stats-${playerId}`,
          }).pipe(
            Effect.catchTag("NotFound", () =>
              Effect.fail(new BrawlhallaPlayerNotFound({ playerId })),
            ),
          ),

        getPlayerRankedById: (playerId: number) =>
          fetchApi({
            name: "getPlayerRankedById",
            schema: BrawlhallaApiPlayerRanked,
            path: `/player/${playerId}/ranked`,
            cacheName: `brawlhalla-player-ranked-${playerId}`,
          }).pipe(
            Effect.catchTag("NotFound", () =>
              Effect.fail(new BrawlhallaPlayerNotFound({ playerId })),
            ),
          ),

        getRankings1v1: (region: string, page: number, name?: string) =>
          fetchApi({
            name: "getRankings1v1",
            schema: BrawlhallaApiRankings1v1,
            path: `/rankings/1v1/${region.toLowerCase()}/${page}${name ? `?name=${name}` : ""}`,
            cacheName: `brawlhalla-rankings-1v1-${region}-${page}-${name}`,
          }),

        getRankings2v2: (region: string, page: number) =>
          fetchApi({
            name: "getRankings2v2",
            schema: BrawlhallaApiRankings2v2,
            path: `/rankings/2v2/${region.toLowerCase()}/${page}`,
            cacheName: `brawlhalla-rankings-2v2-${region}-${page}`,
          }),

        getClanById: (clanId: number) =>
          fetchApi({
            name: "getClanById",
            schema: BrawlhallaApiClan,
            path: `/clan/${clanId}`,
            cacheName: `brawlhalla-clan-${clanId}`,
          }).pipe(
            Effect.catchTag("NotFound", () =>
              Effect.fail(new BrawlhallaClanNotFound({ clanId })),
            ),
          ),

        getAllLegendsData: () =>
          fetchApi({
            name: "getAllLegendsData",
            schema: BrawlhallaApiLegends,
            path: "/legend/all",
            cacheName: "brawlhalla-legend-all",
          }),
      }

      return BrawlhallaApi.of(service)
    }),
  ).pipe(Layer.provide(BrawlhallaApiConfig.layer))
}
