import {
  HttpClient,
  HttpClientRequest,
  HttpServerRequest,
  HttpServerResponse,
} from "effect/unstable/http"
import { Config, Duration, Effect, Option, Redacted, Schema } from "effect"
import { Cache } from "@/services/cache"

const BRAWLHALLA_API_BASE_URL = "https://api.brawlhalla.com"
const PROXY_PREFIX = "/proxy/brawlhalla-api"
const DEFAULT_CACHE_TTL_SECONDS = 300 // 5 minutes

// Schema for cached proxy response
const CachedProxyResponseSchema = Schema.Struct({
  status: Schema.Number,
  body: Schema.String,
  contentType: Schema.String,
  updatedAt: Schema.Date,
})

type CachedProxyResponse = typeof CachedProxyResponseSchema.Type

/**
 * Generate a cache key from the proxy path and query params.
 * Excludes api_key for security - we don't want to expose it in cache keys.
 */
const generateCacheKey = (
  path: string,
  queryParams: URLSearchParams,
): string => {
  // Sort params for consistent cache keys
  const sortedParams = new URLSearchParams([...queryParams.entries()].sort())
  const queryString = sortedParams.toString()
  return `proxy:brawlhalla:${path}${queryString ? `?${queryString}` : ""}`
}

/**
 * Middleware that handles Brawlhalla API proxy requests with caching.
 *
 * Intercepts requests to /proxy/brawlhalla-api/* and forwards them
 * to the Brawlhalla API, caching successful responses in Redis.
 *
 * Supports optional api_key query parameter - if not provided,
 * falls back to BRAWLHALLA_API_KEY from environment.
 *
 * Cache behavior:
 * - Caches successful responses (2xx) for 5 minutes by default
 * - Returns X-Cache header (HIT/MISS) to indicate cache status
 * - Returns X-Cache-Updated-At header with timestamp when cached
 */
export const brawlhallaApiProxy = <E, R>(
  httpApp: Effect.Effect<HttpServerResponse.HttpServerResponse, E, R>,
) =>
  Effect.gen(function* () {
    const request = yield* HttpServerRequest.HttpServerRequest

    // Check if this is a proxy request
    if (!request.url.startsWith(PROXY_PREFIX)) {
      return yield* httpApp
    }

    // Extract the path after /proxy/brawlhalla-api
    const urlObj = new URL(request.url, "http://localhost")
    const proxyPath = urlObj.pathname.slice(PROXY_PREFIX.length) || "/"

    // Get query parameters
    const queryParams = new URLSearchParams(urlObj.search)

    // Check if api_key is provided in query params
    const clientApiKey = queryParams.get("api_key")

    // Get the fallback API key from config
    const envApiKey = yield* Config.redacted("BRAWLHALLA_API_KEY")

    // Use client's api_key if provided, otherwise use env var
    const apiKey = clientApiKey ?? Redacted.value(envApiKey)

    // Remove api_key from query params (we'll add the resolved one for the request)
    queryParams.delete("api_key")

    // Generate cache key (without api_key for security)
    const cacheKey = generateCacheKey(proxyPath, queryParams)

    // Try to get from cache first
    const cache = yield* Cache
    const cachedResult = yield* cache
      .get(cacheKey, CachedProxyResponseSchema)
      .pipe(Effect.catch(() => Effect.succeed(Option.none())))

    if (Option.isSome(cachedResult)) {
      const cached = cachedResult.value
      yield* Effect.log(`Cache HIT for proxy: ${proxyPath}`)

      let response = HttpServerResponse.text(cached.body, {
        status: cached.status,
        contentType: cached.contentType,
      })

      response = HttpServerResponse.setHeader(response, "X-Cache", "HIT")
      response = HttpServerResponse.setHeader(
        response,
        "X-Cache-Updated-At",
        cached.updatedAt.toISOString(),
      )

      return response
    }

    // Cache miss - make the actual request
    yield* Effect.log(`Cache MISS for proxy: ${proxyPath}`)

    // Build the target URL
    const targetUrl = new URL(proxyPath, BRAWLHALLA_API_BASE_URL)
    targetUrl.searchParams.set("api_key", apiKey)

    // Add remaining query params
    for (const [key, value] of queryParams.entries()) {
      targetUrl.searchParams.set(key, value)
    }

    // Make the request to Brawlhalla API
    const httpClient = yield* HttpClient.HttpClient
    const proxyRequest = HttpClientRequest.get(targetUrl.toString())

    const response = yield* httpClient.execute(proxyRequest).pipe(
      Effect.flatMap((clientResponse) =>
        Effect.gen(function* () {
          // Get the raw response body as text
          const body = yield* clientResponse.text

          // Build the response with original status and content-type
          const contentType =
            clientResponse.headers["content-type"] ?? "application/json"

          // Cache successful responses (2xx status codes)
          if (clientResponse.status >= 200 && clientResponse.status < 300) {
            const cacheData: CachedProxyResponse = {
              status: clientResponse.status,
              body,
              contentType,
              updatedAt: new Date(),
            }

            // Store in cache (fire and forget - don't block the response)
            yield* cache
              .set(
                cacheKey,
                cacheData,
                Option.some(Duration.seconds(DEFAULT_CACHE_TTL_SECONDS)),
              )
              .pipe(
                Effect.tap(() =>
                  Effect.log(`Cached proxy response for: ${proxyPath}`),
                ),
                Effect.catch(() => Effect.void),
                Effect.forkDetach,
              )
          }

          let response = HttpServerResponse.text(body, {
            status: clientResponse.status,
            contentType,
          })

          response = HttpServerResponse.setHeader(response, "X-Cache", "MISS")

          return response
        }),
      ),
      Effect.catch((error) =>
        Effect.gen(function* () {
          yield* Effect.logError("Proxy error", error)

          // Check if it's a response error with status
          if (
            error &&
            typeof error === "object" &&
            "response" in error &&
            error.response &&
            typeof error.response === "object" &&
            "status" in error.response
          ) {
            const status = error.response.status as number
            return HttpServerResponse.text(
              JSON.stringify({ error: "Brawlhalla API error" }),
              {
                status,
                contentType: "application/json",
              },
            )
          }

          // Generic error
          return HttpServerResponse.text(
            JSON.stringify({ error: "Failed to proxy request" }),
            {
              status: 502,
              contentType: "application/json",
            },
          )
        }),
      ),
    )

    return response
  })
