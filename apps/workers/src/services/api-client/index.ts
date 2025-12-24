import { Api } from "@dair/api-contract"
import {
  HttpApiClient,
  HttpClient,
  HttpClientRequest,
  FetchHttpClient,
} from "@effect/platform"
import { Effect, Layer, Redacted } from "effect"
import { WorkerConfig } from "@/services/config"

export class WorkerApiClient extends Effect.Service<WorkerApiClient>()(
  "@dair/workers/WorkerApiClient",
  {
    effect: Effect.gen(function* () {
      const config = yield* WorkerConfig
      const baseHttpClient = yield* HttpClient.HttpClient

      // Create an HTTP client with the worker API key header
      const httpClient = baseHttpClient.pipe(
        HttpClient.filterStatusOk,
        HttpClient.mapRequest((request) =>
          HttpClientRequest.setHeader(
            request,
            "X-Worker-API-Key",
            Redacted.value(config.workerApiKey),
          ),
        ),
      )

      const client = yield* HttpApiClient.make(Api, {
        baseUrl: config.apiUrl,
      }).pipe(Effect.provide(Layer.succeed(HttpClient.HttpClient, httpClient)))

      return {
        brawlhalla: {
          getPlayerById: Effect.fn("getPlayerById")(function* (
            playerId: number,
          ) {
            return yield* client.brawlhalla["get-player-by-id"]({
              path: { id: playerId },
            }).pipe(Effect.tapError(Effect.logError))
          }),
          getRankings1v1: Effect.fn("getRankings1v1")(function* (
            region: string,
            page: number,
          ) {
            return yield* client.brawlhalla["get-ranked-1v1"]({
              urlParams: { region: region as "all", page },
            })
          }),
          getRankings2v2: Effect.fn("getRankings2v2")(function* (
            region: string,
            page: number,
          ) {
            return yield* client.brawlhalla["get-ranked-2v2"]({
              urlParams: { region: region as "all", page },
            })
          }),
          getRankingsRotating: Effect.fn("getRankingsRotating")(function* (
            region: string,
            page: number,
          ) {
            return yield* client.brawlhalla["get-ranked-rotating"]({
              urlParams: { region: region as "all", page },
            })
          }),
        },
      }
    }),
  },
) {
  static readonly layer = this.Default.pipe(
    Layer.provide(WorkerConfig.layer),
    Layer.provide(FetchHttpClient.layer),
  )
}
