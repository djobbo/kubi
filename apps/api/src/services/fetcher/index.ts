import {
  FetchHttpClient,
  HttpClient,
  HttpClientRequest,
  HttpClientResponse,
} from "@effect/platform"
import type { HttpMethod } from "@effect/platform/HttpMethod"
import { Context, Effect, Layer, pipe, Schedule, Schema } from "effect"
import type { HttpBodyError } from "@effect/platform/HttpBody"
import type { ParseError } from "effect/ParseResult"
import type { TimeoutException } from "effect/Cause"
import type { HttpClientError } from "@effect/platform/HttpClientError"

const DEFAULT_RETRIES = 3
const DEFAULT_TIMEOUT = 10000

type FetchJsonOptions = {
  method: HttpMethod
  url: string
  body?: unknown
  retries?: number
  timeout?: number
  cacheName?: string
  cacheMaxAge?: number
}

/**
 * Fetcher service interface
 */
export interface FetcherService {
  readonly fetchJson: <T, U>(
    schema: Schema.Schema<T, U>,
    options: FetchJsonOptions,
  ) => Effect.Effect<
    {
      data: T
      updatedAt: Date
      cached: boolean
    },
    HttpBodyError | ParseError | TimeoutException | HttpClientError
  >
}

/**
 * Fetcher service for making HTTP requests with caching
 */
export class Fetcher extends Context.Tag("@app/Fetcher")<
  Fetcher,
  FetcherService
>() {
  /**
   * Live layer for Fetcher service
   */
  static readonly layer = Layer.effect(
    Fetcher,
    Effect.gen(function* () {
      const httpClient = yield* HttpClient.HttpClient
      const service: FetcherService = {
        fetchJson: Effect.fn("fetchJson")(function* <T, U>(
          schema: Schema.Schema<T, U>,
          options: FetchJsonOptions,
        ) {
          return yield* pipe(
            options.url,
            HttpClientRequest.make(options.method),
            HttpClientRequest.bodyJson(options.body),
            Effect.flatMap(httpClient.execute),
            Effect.flatMap(HttpClientResponse.schemaBodyJson(schema)),
            Effect.map((json) => ({
              data: json,
              updatedAt: new Date(),
              cached: false,
            })),
            Effect.timeout(options.timeout ?? DEFAULT_TIMEOUT),
            Effect.retry({
              times: options.retries ?? DEFAULT_RETRIES,
              schedule: Schedule.exponential(1000),
            }),
          )
        }),
      }

      return Fetcher.of(service)
    }),
  ).pipe(Layer.provide(FetchHttpClient.layer))
}
