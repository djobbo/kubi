import { Config } from "@/services/config"
import { Fetcher } from "@/services/fetcher"
import {
  BrawlhallaApiError,
  BrawlhallaClanNotFound,
  BrawlhallaPlayerNotFound,
  BrawlhallaRateLimitError,
} from "./errors"
import { Context, Effect, Layer, type Schema } from "effect"
import { BrawlhallaApiClan } from "./schema/clan"
import { BrawlhallaApiLegends } from "./schema/legends"
import { BrawlhallaApiPlayerRanked } from "./schema/player-ranked"
import { BrawlhallaApiPlayerStats } from "./schema/player-stats"
import {
  BrawlhallaApiRankings1v1,
  BrawlhallaApiRankings2v2,
} from "./schema/rankings"
import { NotFound } from "@effect/platform/HttpApiError"
import type { HttpClient } from "@effect/platform"
import type { DB } from "@/services/db"

const BASE_URL = "https://api.brawlhalla.com"

type FetchBrawlhallaApiOptions<T, U> = {
  name: string
  schema: Schema.Schema<T, U>
  path: string
  searchParams?: Record<string, string>
  cacheName: string
}

/**
 * BrawlhallaApi service interface
 */
export interface BrawlhallaApiService {
  readonly getPlayerStatsById: (playerId: number) => Effect.Effect<
    {
      data: typeof BrawlhallaApiPlayerStats.Type
      updatedAt: Date
      cached: boolean
    },
    BrawlhallaApiError | BrawlhallaPlayerNotFound | BrawlhallaRateLimitError,
    Fetcher | HttpClient.HttpClient | DB | Config
  >
  readonly getPlayerRankedById: (playerId: number) => Effect.Effect<
    {
      data: typeof BrawlhallaApiPlayerRanked.Type
      updatedAt: Date
      cached: boolean
    },
    BrawlhallaApiError | BrawlhallaPlayerNotFound | BrawlhallaRateLimitError,
    Fetcher | HttpClient.HttpClient | DB | Config
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
    BrawlhallaApiError | BrawlhallaRateLimitError | NotFound,
    Fetcher | HttpClient.HttpClient | DB | Config
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
    BrawlhallaApiError | BrawlhallaRateLimitError | NotFound,
    Fetcher | HttpClient.HttpClient | DB | Config
  >
  readonly getClanById: (
    clanId: number,
  ) => Effect.Effect<
    { data: typeof BrawlhallaApiClan.Type; updatedAt: Date; cached: boolean },
    BrawlhallaApiError | BrawlhallaClanNotFound | BrawlhallaRateLimitError,
    Fetcher | HttpClient.HttpClient | DB | Config
  >
  readonly getAllLegendsData: () => Effect.Effect<
    {
      data: typeof BrawlhallaApiLegends.Type
      updatedAt: Date
      cached: boolean
    },
    BrawlhallaApiError | BrawlhallaRateLimitError | NotFound,
    Fetcher | HttpClient.HttpClient | DB | Config
  >
}

/**
 * BrawlhallaApi service tag for dependency injection
 */
export class BrawlhallaApi extends Context.Tag("BrawlhallaApi")<
  BrawlhallaApi,
  BrawlhallaApiService
>() {}

/**
 * Helper function to fetch data from Brawlhalla API with error handling
 */
const fetchBrawlhallaApi = <T, U>({
  name,
  schema,
  path,
  searchParams = {},
  cacheName,
}: FetchBrawlhallaApiOptions<T, U>) =>
  Effect.gen(function* () {
    const config = yield* Config
    const fetcher = yield* Fetcher
    const apiKey = config.brawlhalla.apiKey

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

/**
 * Creates the BrawlhallaApi service implementation
 */
const makeBrawlhallaApi = () => {
  const service: BrawlhallaApiService = {
    getPlayerStatsById: (playerId: number) =>
      fetchBrawlhallaApi({
        name: "getPlayerStatsById",
        schema: BrawlhallaApiPlayerStats,
        path: `/player/${playerId}/stats`,
        cacheName: `brawlhalla-player-stats-${playerId}`,
      }).pipe(
        Effect.catchTag("NotFound", () => {
          return Effect.fail(new BrawlhallaPlayerNotFound({ playerId }))
        }),
      ),

    getPlayerRankedById: (playerId: number) =>
      fetchBrawlhallaApi({
        name: "getPlayerRankedById",
        schema: BrawlhallaApiPlayerRanked,
        path: `/player/${playerId}/ranked`,
        cacheName: `brawlhalla-player-ranked-${playerId}`,
      }).pipe(
        Effect.catchTag("NotFound", () => {
          return Effect.fail(new BrawlhallaPlayerNotFound({ playerId }))
        }),
      ),

    getRankings1v1: (region: string, page: number, name?: string) =>
      fetchBrawlhallaApi({
        name: "getRankings1v1",
        schema: BrawlhallaApiRankings1v1,
        path: `/rankings/1v1/${region.toLowerCase()}/${page}${name ? `?name=${name}` : ""}`,
        cacheName: `brawlhalla-rankings-1v1-${region}-${page}-${name}`,
      }),

    getRankings2v2: (region: string, page: number) =>
      fetchBrawlhallaApi({
        name: "getRankings2v2",
        schema: BrawlhallaApiRankings2v2,
        path: `/rankings/2v2/${region.toLowerCase()}/${page}`,
        cacheName: `brawlhalla-rankings-2v2-${region}-${page}`,
      }),

    getClanById: (clanId: number) =>
      fetchBrawlhallaApi({
        name: "getClanById",
        schema: BrawlhallaApiClan,
        path: `/clan/${clanId}`,
        cacheName: `brawlhalla-clan-${clanId}`,
      }).pipe(
        Effect.catchTag("NotFound", () => {
          return Effect.fail(new BrawlhallaClanNotFound({ clanId }))
        }),
      ),

    getAllLegendsData: () =>
      fetchBrawlhallaApi({
        name: "getAllLegendsData",
        schema: BrawlhallaApiLegends,
        path: "/legend/all",
        cacheName: "brawlhalla-legend-all",
      }),
  }

  return Effect.succeed(service)
}

/**
 * Live layer for BrawlhallaApi service
 * Requires: Config, Fetcher
 */
export const BrawlhallaApiLive = Layer.effect(
  BrawlhallaApi,
  makeBrawlhallaApi(),
)
