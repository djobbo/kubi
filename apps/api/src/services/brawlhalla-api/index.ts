import { Fetcher } from "@/services/fetcher"
import { BrawlhallaRateLimiter } from "@/services/rate-limiter"
import { shouldUseFetchFirst } from "@/services/fetch-strategy"
import {
  BrawlhallaApiError,
  BrawlhallaClanNotFound,
  BrawlhallaPlayerNotFound,
  BrawlhallaRateLimitError,
} from "./errors"
import { Config, Effect, flow, Layer, Redacted, type Schema } from "effect"
import { BrawlhallaApiClan } from "./schema/clan"
import { BrawlhallaApiLegends } from "./schema/legends"
import { BrawlhallaApiPlayerRanked } from "./schema/player-ranked"
import { BrawlhallaApiPlayerStats } from "./schema/player-stats"
import {
  BrawlhallaApiRankings1v1,
  BrawlhallaApiRankings2v2,
  BrawlhallaApiRankingsRotating,
} from "./schema/rankings"
import { NotFound } from "@effect/platform/HttpApiError"

const BASE_URL = "https://api.brawlhalla.com"

type FetchBrawlhallaApiOptions<T, U> = {
  schema: Schema.Schema<T, U>
  path: string
  searchParams?: Record<string, string>
  cacheName: string
}

export class BrawlhallaApi extends Effect.Service<BrawlhallaApi>()(
  "@dair/services/BrawlhallaApi",
  {
    effect: Effect.gen(function* () {
      const apiKey = yield* Config.redacted("BRAWLHALLA_API_KEY")
      const fetcher = yield* Fetcher

      const getRequestUrl = (
        path: string,
        searchParams: Record<string, string>,
      ) => {
        const url = new URL(path, BASE_URL)
        for (const [key, value] of Object.entries(searchParams)) {
          url.searchParams.set(key, value)
        }
        url.searchParams.set("api_key", Redacted.value(apiKey))
        return url.toString()
      }

      /**
       * Core fetch function that handles rate limiting correctly:
       * - Rate limiter is only applied to the actual API call, not cache lookups
       * - Automatically detects fetch strategy from RequestFetchStrategy context
       *   - cache-first for frontend requests (default)
       *   - fetch-first for worker requests (when X-Worker-API-Key header is present)
       */
      const fetchBrawlhallaApi = Effect.fn("fetchBrawlhallaApi")(
        function* <T, U>({
          schema,
          path,
          searchParams = {},
          cacheName,
        }: FetchBrawlhallaApiOptions<T, U>) {
          const url = getRequestUrl(path, searchParams)

          // Determine cache strategy from context (set by worker auth middleware)
          const useFetchFirst = yield* shouldUseFetchFirst
          const rateLimiter = yield* BrawlhallaRateLimiter

          if (!useFetchFirst) {
            // Cache-first mode: Check cache first, rate limit only on actual API call
            return yield* fetcher
              .fetchJsonCacheFirst(schema, {
                method: "GET",
                url: url.toString(),
                cacheName,
              })
              .pipe(rateLimiter.limit)
          } else {
            // Direct fetch mode: Rate limit and fetch directly (for workers via HTTP)
            return yield* rateLimiter.limit(
              fetcher.fetchJson(schema, {
                method: "GET",
                url: url.toString(),
                cacheName,
              }),
            )
          }
        },
        flow(
          Effect.catchTags({
            ResponseError: (error) =>
              Effect.gen(function* () {
                switch (error.response.status) {
                  case 404:
                    return yield* Effect.fail(new NotFound())
                  case 429:
                    return yield* BrawlhallaRateLimitError.make({
                      message:
                        "Rate limit exceeded for Brawlhalla API. Please try again later.",
                    })
                  default:
                    return yield* BrawlhallaApiError.make({
                      cause: error,
                      message: `Brawlhalla API request failed with status ${error.response.status}`,
                      status: error.response.status,
                    })
                }
              }),
            HttpBodyError: (error) =>
              BrawlhallaApiError.make({
                cause: error,
                message: "Failed to parse Brawlhalla API response",
              }),
            ParseError: (error) =>
              BrawlhallaApiError.make({
                cause: error,
                message: "Failed to parse Brawlhalla API response",
              }),
            RequestError: (error) =>
              BrawlhallaApiError.make({
                cause: error,
                message: "Failed to make request to Brawlhalla API",
              }),
            TimeoutException: (error) =>
              BrawlhallaApiError.make({
                cause: error,
                message: "Brawlhalla API request timed out",
              }),
          }),
        ),
      )

      return {
        getPlayerStatsById: Effect.fn("getPlayerStatsById")(function* (
          playerId: number,
        ) {
          return yield* fetchBrawlhallaApi({
            schema: BrawlhallaApiPlayerStats,
            path: `/player/${playerId}/stats`,
            cacheName: `brawlhalla-player-stats-${playerId}`,
          }).pipe(
            Effect.catchTag("NotFound", () =>
              Effect.fail(new BrawlhallaPlayerNotFound({ playerId })),
            ),
          )
        }),
        getPlayerRankedById: Effect.fn("getPlayerRankedById")(function* (
          playerId: number,
        ) {
          return yield* fetchBrawlhallaApi({
            schema: BrawlhallaApiPlayerRanked,
            path: `/player/${playerId}/ranked`,
            cacheName: `brawlhalla-player-ranked-${playerId}`,
          }).pipe(
            Effect.catchTag("NotFound", () =>
              Effect.fail(new BrawlhallaPlayerNotFound({ playerId })),
            ),
          )
        }),
        getRankings1v1: Effect.fn("getRankings1v1")(function* (
          region: string,
          page: number,
          name?: string,
        ) {
          return yield* fetchBrawlhallaApi({
            schema: BrawlhallaApiRankings1v1,
            path: `/rankings/1v1/${region.toLowerCase()}/${page}${name ? `?name=${name}` : ""}`,
            cacheName: `brawlhalla-rankings-1v1-${region}-${page}-${name ?? ""}`,
          })
        }),
        getRankings2v2: Effect.fn("getRankings2v2")(function* (
          region: string,
          page: number,
        ) {
          return yield* fetchBrawlhallaApi({
            schema: BrawlhallaApiRankings2v2,
            path: `/rankings/2v2/${region.toLowerCase()}/${page}`,
            cacheName: `brawlhalla-rankings-2v2-${region}-${page}`,
          })
        }),
        getRankingsRotating: Effect.fn("getRankingsRotating")(function* (
          region: string,
          page: number,
        ) {
          return yield* fetchBrawlhallaApi({
            schema: BrawlhallaApiRankingsRotating,
            path: `/rankings/rotating/${region.toLowerCase()}/${page}`,
            cacheName: `brawlhalla-rankings-rotating-${region}-${page}`,
          })
        }),
        getClanById: Effect.fn("getClanById")(function* (clanId: number) {
          return yield* fetchBrawlhallaApi({
            schema: BrawlhallaApiClan,
            path: `/clan/${clanId}`,
            cacheName: `brawlhalla-clan-${clanId}`,
          }).pipe(
            Effect.catchTag("NotFound", () =>
              Effect.fail(new BrawlhallaClanNotFound({ clanId })),
            ),
          )
        }),
        getAllLegendsData: Effect.fn("getAllLegendsData")(function* () {
          return yield* fetchBrawlhallaApi({
            schema: BrawlhallaApiLegends,
            path: "/legend/all",
            cacheName: "brawlhalla-legend-all",
          })
        }),
      }
    }),
  },
) {
  static readonly layer = this.Default.pipe(
    Layer.provide(Fetcher.layer),
    Layer.provide(BrawlhallaRateLimiter.layer),
  )
}
