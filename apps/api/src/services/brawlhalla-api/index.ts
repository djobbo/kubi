import { Fetcher } from "@/services/fetcher"
import { BrawlhallaRateLimiter } from "@/services/rate-limiter"
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
  /** Whether to use worker rate limiter (default: false = frontend limiter) */
  useWorkerRateLimiter?: boolean
  /** Whether to use cache-first with background revalidation (default: true for frontend) */
  cacheFirst?: boolean
}

export class BrawlhallaApi extends Effect.Service<BrawlhallaApi>()(
  "@dair/services/BrawlhallaApi",
  {
    effect: Effect.gen(function* () {
      const apiKey = yield* Config.redacted("BRAWLHALLA_API_KEY")
      const fetcher = yield* Fetcher
      const rateLimiter = yield* BrawlhallaRateLimiter

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
       * - Supports both frontend (cache-first) and worker (direct fetch) modes
       */
      const fetchBrawlhallaApi = Effect.fn("fetchBrawlhallaApi")(
        function* <T, U>({
          schema,
          path,
          searchParams = {},
          cacheName,
          useWorkerRateLimiter = false,
          cacheFirst = true,
        }: FetchBrawlhallaApiOptions<T, U>) {
          const url = getRequestUrl(path, searchParams)

          // Select the appropriate rate limiter
          const applyRateLimit = useWorkerRateLimiter
            ? rateLimiter.limitWorker
            : rateLimiter.limitFrontend

          // Rate limiting is applied ONLY to the actual API fetch, not the cache layer
          // The fetcher handles caching internally and only calls the rate-limited fetch on cache miss
          if (cacheFirst) {
            // Cache-first mode: Check cache first, rate limit only on actual API call
            return yield* fetcher.fetchJsonCacheFirst(schema, {
              method: "GET",
              url: url.toString(),
              cacheName,
              rateLimitedFetch: applyRateLimit,
            })
          } else {
            // Direct fetch mode: Rate limit and fetch directly (for workers)
            return yield* applyRateLimit(
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

      // Helper to create frontend API methods (cache-first with frontend rate limiter)
      const createFrontendMethod = <T, U>(
        options: Omit<
          FetchBrawlhallaApiOptions<T, U>,
          "useWorkerRateLimiter" | "cacheFirst"
        >,
      ) =>
        fetchBrawlhallaApi({
          ...options,
          useWorkerRateLimiter: false,
          cacheFirst: true,
        })

      // Helper to create worker API methods (direct fetch with worker rate limiter)
      const createWorkerMethod = <T, U>(
        options: Omit<
          FetchBrawlhallaApiOptions<T, U>,
          "useWorkerRateLimiter" | "cacheFirst"
        >,
      ) =>
        fetchBrawlhallaApi({
          ...options,
          useWorkerRateLimiter: true,
          cacheFirst: false,
        })

      return {
        // ========== Frontend Methods (cache-first, frontend rate limiter) ==========

        getPlayerStatsById: Effect.fn("getPlayerStatsById")(function* (
          playerId: number,
        ) {
          return yield* createFrontendMethod({
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
          return yield* createFrontendMethod({
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
          return yield* createFrontendMethod({
            schema: BrawlhallaApiRankings1v1,
            path: `/rankings/1v1/${region.toLowerCase()}/${page}${name ? `?name=${name}` : ""}`,
            cacheName: `brawlhalla-rankings-1v1-${region}-${page}-${name ?? ""}`,
          })
        }),
        getRankings2v2: Effect.fn("getRankings2v2")(function* (
          region: string,
          page: number,
        ) {
          return yield* createFrontendMethod({
            schema: BrawlhallaApiRankings2v2,
            path: `/rankings/2v2/${region.toLowerCase()}/${page}`,
            cacheName: `brawlhalla-rankings-2v2-${region}-${page}`,
          })
        }),
        getRankingsRotating: Effect.fn("getRankingsRotating")(function* (
          region: string,
          page: number,
        ) {
          return yield* createFrontendMethod({
            schema: BrawlhallaApiRankingsRotating,
            path: `/rankings/rotating/${region.toLowerCase()}/${page}`,
            cacheName: `brawlhalla-rankings-rotating-${region}-${page}`,
          })
        }),
        getClanById: Effect.fn("getClanById")(function* (clanId: number) {
          return yield* createFrontendMethod({
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
          return yield* createFrontendMethod({
            schema: BrawlhallaApiLegends,
            path: "/legend/all",
            cacheName: "brawlhalla-legend-all",
          })
        }),

        // ========== Worker Methods (no cache-first, worker rate limiter) ==========

        worker: {
          getPlayerStatsById: Effect.fn("worker.getPlayerStatsById")(function* (
            playerId: number,
          ) {
            return yield* createWorkerMethod({
              schema: BrawlhallaApiPlayerStats,
              path: `/player/${playerId}/stats`,
              cacheName: `brawlhalla-player-stats-${playerId}`,
            }).pipe(
              Effect.catchTag("NotFound", () =>
                Effect.fail(new BrawlhallaPlayerNotFound({ playerId })),
              ),
            )
          }),
          getPlayerRankedById: Effect.fn("worker.getPlayerRankedById")(
            function* (playerId: number) {
              return yield* createWorkerMethod({
                schema: BrawlhallaApiPlayerRanked,
                path: `/player/${playerId}/ranked`,
                cacheName: `brawlhalla-player-ranked-${playerId}`,
              }).pipe(
                Effect.catchTag("NotFound", () =>
                  Effect.fail(new BrawlhallaPlayerNotFound({ playerId })),
                ),
              )
            },
          ),
          getRankings1v1: Effect.fn("worker.getRankings1v1")(function* (
            region: string,
            page: number,
            name?: string,
          ) {
            return yield* createWorkerMethod({
              schema: BrawlhallaApiRankings1v1,
              path: `/rankings/1v1/${region.toLowerCase()}/${page}${name ? `?name=${name}` : ""}`,
              cacheName: `brawlhalla-rankings-1v1-${region}-${page}-${name ?? ""}`,
            })
          }),
          getRankings2v2: Effect.fn("worker.getRankings2v2")(function* (
            region: string,
            page: number,
          ) {
            return yield* createWorkerMethod({
              schema: BrawlhallaApiRankings2v2,
              path: `/rankings/2v2/${region.toLowerCase()}/${page}`,
              cacheName: `brawlhalla-rankings-2v2-${region}-${page}`,
            })
          }),
          getRankingsRotating: Effect.fn("worker.getRankingsRotating")(
            function* (region: string, page: number) {
              return yield* createWorkerMethod({
                schema: BrawlhallaApiRankingsRotating,
                path: `/rankings/rotating/${region.toLowerCase()}/${page}`,
                cacheName: `brawlhalla-rankings-rotating-${region}-${page}`,
              })
            },
          ),
          getClanById: Effect.fn("worker.getClanById")(function* (
            clanId: number,
          ) {
            return yield* createWorkerMethod({
              schema: BrawlhallaApiClan,
              path: `/clan/${clanId}`,
              cacheName: `brawlhalla-clan-${clanId}`,
            }).pipe(
              Effect.catchTag("NotFound", () =>
                Effect.fail(new BrawlhallaClanNotFound({ clanId })),
              ),
            )
          }),
          getAllLegendsData: Effect.fn("worker.getAllLegendsData")(
            function* () {
              return yield* createWorkerMethod({
                schema: BrawlhallaApiLegends,
                path: "/legend/all",
                cacheName: "brawlhalla-legend-all",
              })
            },
          ),
        },
      }
    }),
  },
) {
  static readonly layer = this.Default.pipe(
    Layer.provide(Fetcher.layer),
    Layer.provide(BrawlhallaRateLimiter.layer),
  )
}
