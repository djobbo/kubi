import {
  FetchHttpClient,
  HttpClient,
  HttpClientRequest,
  HttpClientResponse,
} from "@effect/platform"
import type { HttpMethod } from "@effect/platform/HttpMethod"
import { Duration, Effect, Layer, Option, pipe, Schedule, Schema } from "effect"
import { Cache } from "@/services/cache"
import { BrawlhallaRateLimiter } from "../rate-limiter"

const DEFAULT_RETRIES = 3
const DEFAULT_TIMEOUT = 10000
const DEFAULT_CACHE_MAX_AGE = 300 // 5 minutes
const DEFAULT_STALE_MAX_AGE = 3600 // 1 hour (stale data can be served for up to 1 hour while revalidating)

type FetchJsonOptions = {
  method: HttpMethod
  url: string
  body?: unknown
  retries?: number
  timeout?: number
  cacheName?: string
  cacheMaxAge?: number
}

type FetchJsonCacheFirstOptions = FetchJsonOptions & {
  /**
   * Maximum age for stale data (seconds)
   * Stale data can be served while revalidating in the background
   * Default: 1 hour
   */
  staleMaxAge?: number
}

export class Fetcher extends Effect.Service<Fetcher>()("@app/Fetcher", {
  effect: Effect.gen(function* () {
    const httpClient = yield* HttpClient.HttpClient
    const cache = yield* Cache

    /**
     * Simple fetch without cache-first behavior
     * Used by workers that need fresh data
     */
    const fetchJson = Effect.fn("fetchJson")(function* <T, U>(
      schema: Schema.Schema<T, U>,
      options: FetchJsonOptions,
    ) {
      const fetchFromApi = pipe(
        options.url,
        HttpClientRequest.make(options.method),
        HttpClientRequest.bodyJson(options.body),
        Effect.flatMap(httpClient.execute),
        Effect.flatMap(HttpClientResponse.schemaBodyJson(schema)),
        Effect.timeout(options.timeout ?? DEFAULT_TIMEOUT),
        Effect.retry({
          times: options.retries ?? DEFAULT_RETRIES,
          schedule: Schedule.exponential(1000),
        }),
      )

      // If no cache name is provided, just fetch directly
      if (!options.cacheName) {
        return yield* fetchFromApi.pipe(
          Effect.map((data) => ({
            data,
            updatedAt: new Date(),
            cached: false,
          })),
        )
      }

      // Use Redis cache with getOrSet pattern
      const cacheKey = `fetcher:${options.cacheName}`
      const ttl = options.cacheMaxAge ?? DEFAULT_CACHE_MAX_AGE

      return yield* cache.getOrSet(
        cacheKey,
        schema,
        fetchFromApi,
        Option.some(Duration.seconds(ttl)),
      )
    })

    /**
     * Cache-first fetch with background revalidation (stale-while-revalidate)
     *
     * Behavior:
     * 1. If fresh cache exists (< cacheMaxAge), return it immediately
     * 2. If stale cache exists (< staleMaxAge), return it AND trigger background revalidation
     * 3. If no cache exists, fetch with rate limiting and cache the result
     *
     * This approach:
     * - Never blocks the user on rate limiting if cache is available
     * - Rate limiter is only consumed when actually making API requests
     * - Stale data is acceptable for short periods while fresh data loads
     */
    const fetchJsonCacheFirst = Effect.fn("fetchJsonCacheFirst")(function* <
      T,
      U,
    >(schema: Schema.Schema<T, U>, options: FetchJsonCacheFirstOptions) {
      const cacheKey = options.cacheName
        ? `fetcher:${options.cacheName}`
        : undefined
      // Use staleMaxAge for cache TTL - data can be served while revalidating in the background
      const staleTtl = options.staleMaxAge ?? DEFAULT_STALE_MAX_AGE

      const fetchFromApi = pipe(
        options.url,
        HttpClientRequest.make(options.method),
        HttpClientRequest.bodyJson(options.body),
        Effect.flatMap(httpClient.execute),
        Effect.flatMap(HttpClientResponse.schemaBodyJson(schema)),
        Effect.timeout(options.timeout ?? DEFAULT_TIMEOUT),
        Effect.retry({
          times: options.retries ?? DEFAULT_RETRIES,
          schedule: Schedule.exponential(1000),
        }),
      )

      // If no cache name, fetch directly with rate limiting
      if (!cacheKey) {
        return yield* fetchFromApi.pipe(
          Effect.map((data) => ({
            data,
            updatedAt: new Date(),
            cached: false,
          })),
        )
      }

      // Try to get from cache first
      const cachedResult = yield* cache.get(cacheKey, schema)

      if (Option.isSome(cachedResult)) {
        // Return cached data immediately
        yield* Effect.log(`Cache hit for ${options.cacheName}`)

        // Queue background revalidation (fire and forget)
        // This will update the cache with fresh data for the next request
        yield* Effect.fork(
          fetchFromApi.pipe(
            Effect.tap((data) =>
              cache.set(
                cacheKey,
                data,
                Option.some(Duration.seconds(staleTtl)),
              ),
            ),
            Effect.tap(() =>
              Effect.log(`Background revalidation complete for ${cacheKey}`),
            ),
            Effect.catchAll((error) =>
              Effect.logWarning(
                `Background revalidation failed for ${cacheKey}`,
                { error },
              ),
            ),
          ),
        )

        return {
          data: cachedResult.value,
          updatedAt: new Date(),
          cached: true,
        }
      }

      // No cache, must fetch (this is the only path that blocks on rate limiting)
      yield* Effect.log(`Cache miss for ${options.cacheName}, fetching...`)
      const data = yield* fetchFromApi

      // Store in cache
      yield* cache.set(cacheKey, data, Option.some(Duration.seconds(staleTtl)))

      return {
        data,
        updatedAt: new Date(),
        cached: false,
      }
    })

    return {
      fetchJson,
      fetchJsonCacheFirst,
    }
  }),
}) {
  static readonly layer = this.Default.pipe(
    Layer.provide(FetchHttpClient.layer),
    Layer.provide(Cache.layer),
  )
}
