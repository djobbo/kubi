import {
  FetchHttpClient,
  HttpClient,
  HttpClientRequest,
  HttpClientResponse,
} from "@effect/platform"
import type { HttpMethod } from "@effect/platform/HttpMethod"
import { Effect, Layer, pipe, Schedule, Schema } from "effect"

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

export class Fetcher extends Effect.Service<Fetcher>()("@app/Fetcher", {
  effect: Effect.gen(function* () {
    const httpClient = yield* HttpClient.HttpClient

    return {
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
  }),
}) {
  static readonly layer = this.Default.pipe(
    Layer.provide(FetchHttpClient.layer),
  )
}
