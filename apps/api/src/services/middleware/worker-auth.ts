import { HttpServerRequest, HttpServerResponse } from "@effect/platform"
import { Effect, Layer, Option, Redacted } from "effect"
import { ApiServerConfig } from "@/services/config/api-server-config"
import { RequestFetchStrategy } from "@/services/fetch-strategy"

/**
 * Middleware that authenticates worker requests and sets the fetch strategy.
 *
 * If the X-Worker-API-Key header matches the configured WORKER_API_KEY,
 * the request is considered a worker request and uses fetch-first strategy.
 * Otherwise, cache-first strategy is used (default for frontend).
 */
export const workerAuthMiddleware = <E, R>(
  httpApp: Effect.Effect<HttpServerResponse.HttpServerResponse, E, R>,
) =>
  Effect.gen(function* () {
    const config = yield* ApiServerConfig
    const request = yield* HttpServerRequest.HttpServerRequest

    // Check if worker API key is configured
    const configuredKey = config.workerApiKey

    // Get the header value
    const headerKey = request.headers["x-worker-api-key"]

    // Determine if this is a valid worker request
    const isWorkerRequest =
      Option.isSome(configuredKey) && headerKey
        ? Redacted.value(configuredKey.value) === headerKey
        : false

    // Set the fetch strategy based on authentication
    const fetchStrategy = isWorkerRequest ? "fetch-first" : "cache-first"

    // Run the app with the appropriate fetch strategy
    return yield* httpApp.pipe(
      Effect.provide(Layer.succeed(RequestFetchStrategy, fetchStrategy)),
    )
  })
