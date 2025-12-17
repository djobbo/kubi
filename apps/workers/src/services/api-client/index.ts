import { Api } from "@dair/api-contract"
import {
  HttpApiClient,
  HttpClient,
  HttpClientRequest,
  FetchHttpClient,
} from "@effect/platform"
import { Effect, Layer, Redacted } from "effect"
import { WorkerConfig } from "@/services/config"

/**
 * API client service for workers.
 * Uses Effect HttpClient to call the main API with worker authentication.
 */
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

      // Create the typed API client
      const client = yield* HttpApiClient.make(Api, {
        baseUrl: config.apiUrl,
      }).pipe(Effect.provide(Layer.succeed(HttpClient.HttpClient, httpClient)))

      return {
        /**
         * Brawlhalla API methods (calls our API with worker auth)
         */
        brawlhalla: {
          /**
           * Get player by ID
           */
          getPlayerById: Effect.fn("getPlayerById")(function* (
            playerId: number,
          ) {
            return yield* client.brawlhalla["get-player-by-id"]({
              path: { id: playerId },
            })
          }),

          /**
           * Get 1v1 rankings
           */
          getRankings1v1: Effect.fn("getRankings1v1")(function* (
            region: string,
            page: number,
          ) {
            return yield* client.brawlhalla["get-ranked-1v1"]({
              urlParams: { region: region as "all", page },
            })
          }),

          /**
           * Get 2v2 rankings
           */
          getRankings2v2: Effect.fn("getRankings2v2")(function* (
            region: string,
            page: number,
          ) {
            return yield* client.brawlhalla["get-ranked-2v2"]({
              urlParams: { region: region as "all", page },
            })
          }),

          /**
           * Get rotating rankings
           */
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
