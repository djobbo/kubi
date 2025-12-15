import {
  FetchHttpClient,
  HttpClient,
  HttpClientRequest,
  HttpClientResponse,
} from "@effect/platform"
import type { HttpMethod } from "@effect/platform/HttpMethod"
import { Duration, Effect, Layer, Option, pipe, Schedule, Schema } from "effect"
import { Cache } from "@/services/cache"

const DEFAULT_RETRIES = 3
const DEFAULT_TIMEOUT = 10000
const DEFAULT_CACHE_MAX_AGE = 300 // 5 minutes

type FetchJsonOptions = {
  method: HttpMethod
  url: string
  body?: unknown
  retries?: number
  timeout?: number
  cacheName?: string
  cacheMaxAge?: number
}

export class Fetcher extends Effect.Service<Fetcher>()("@app/Fetcher", {
  effect: Effect.gen(function* () {
    const httpClient = yield* HttpClient.HttpClient
    const cache = yield* Cache

    return {
      fetchJson: Effect.fn("fetchJson")(function* <T, U>(
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
          Option.some(Duration.millis(ttl)),
        )
      }),
    }
  }),
}) {
  static readonly layer = this.Default.pipe(
    Layer.provide(FetchHttpClient.layer),
    Layer.provide(Cache.layer),
  )
}
