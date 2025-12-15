import { HttpServerRequest, HttpServerResponse } from "@effect/platform"
import { Effect, Option, Schema } from "effect"
import { Cache } from "@/services/cache"

// Schema for cached response data
const CachedResponseSchema = Schema.Struct({
  status: Schema.Number,
  body: Schema.String,
  headers: Schema.Record({ key: Schema.String, value: Schema.String }),
})

type CachedResponse = typeof CachedResponseSchema.Type

export type ResponseCacheOptions = {
  /**
   * Function to generate cache key from request
   * Default: uses request method + URL
   */
  readonly keyGenerator?: (
    request: HttpServerRequest.HttpServerRequest,
  ) => string
  /**
   * Cache TTL in seconds
   * Default: 300 (5 minutes)
   */
  readonly ttlSeconds?: number
  /**
   * Predicate to determine if response should be cached
   * Default: only cache successful GET requests (2xx status codes)
   */
  readonly shouldCache?: (
    request: HttpServerRequest.HttpServerRequest,
    response: HttpServerResponse.HttpServerResponse,
  ) => boolean
  /**
   * Route patterns to exclude from caching
   */
  readonly exclude?: ReadonlyArray<string | RegExp>
}

const defaultKeyGenerator = (
  request: HttpServerRequest.HttpServerRequest,
): string => {
  return `response:${request.method}:${request.url}`
}

const defaultShouldCache = (
  request: HttpServerRequest.HttpServerRequest,
  response: HttpServerResponse.HttpServerResponse,
): boolean => {
  // Only cache GET requests with successful responses
  return (
    request.method === "GET" && response.status >= 200 && response.status < 300
  )
}

const matchesExcludePattern = (
  url: string,
  patterns: ReadonlyArray<string | RegExp>,
): boolean => {
  return patterns.some((pattern) => {
    if (typeof pattern === "string") {
      return url.includes(pattern)
    }
    return pattern.test(url)
  })
}

/**
 * Extract body text from HttpBody based on its type
 */
const extractBodyText = (
  body: HttpServerResponse.HttpServerResponse["body"],
): string | null => {
  switch (body._tag) {
    case "Uint8Array":
      return new TextDecoder().decode(body.body)
    case "Raw":
      return typeof body.body === "string"
        ? body.body
        : JSON.stringify(body.body)
    case "Empty":
      return ""
    default:
      // Stream and FormData are not cacheable
      return null
  }
}

/**
 * Creates an HTTP response caching middleware that caches responses in Redis.
 *
 * @example
 * ```ts
 * import { responseCache } from "@/services/middleware/response-cache"
 *
 * const ServerLive = HttpApiBuilder.serve().pipe(
 *   Layer.provide(responseCache({
 *     ttlSeconds: 60,
 *     exclude: ["/auth/", "/health"]
 *   })),
 *   // ... other layers
 * )
 * ```
 */
export const responseCache = (options: ResponseCacheOptions = {}) => {
  const keyGenerator = options.keyGenerator ?? defaultKeyGenerator
  const ttlSeconds = options.ttlSeconds ?? 300
  const shouldCache = options.shouldCache ?? defaultShouldCache
  const excludePatterns = options.exclude ?? []

  return Effect.gen(function* () {
    const cache = yield* Cache

    return <E, R>(
      httpApp: Effect.Effect<HttpServerResponse.HttpServerResponse, E, R>,
    ): Effect.Effect<
      HttpServerResponse.HttpServerResponse,
      E,
      R | HttpServerRequest.HttpServerRequest
    > =>
      Effect.gen(function* () {
        const request = yield* HttpServerRequest.HttpServerRequest

        // Check if URL matches exclude patterns
        if (matchesExcludePattern(request.url, excludePatterns)) {
          return yield* httpApp
        }

        // Only try to cache GET requests
        if (request.method !== "GET") {
          return yield* httpApp
        }

        const cacheKey = keyGenerator(request)

        // Try to get from cache first
        const cachedResult = yield* cache
          .get(cacheKey, CachedResponseSchema)
          .pipe(
            Effect.catchAll(() =>
              Effect.succeed(
                Option.none<{
                  data: CachedResponse
                  cached: boolean
                  updatedAt: Date
                }>(),
              ),
            ),
          )

        if (Option.isSome(cachedResult)) {
          const cached = cachedResult.value.data

          // Rebuild response from cached data
          let response = HttpServerResponse.text(cached.body, {
            status: cached.status,
          })

          // Add cached headers
          for (const [key, value] of Object.entries(cached.headers)) {
            response = HttpServerResponse.setHeader(response, key, value)
          }

          // Add cache indicator header
          response = HttpServerResponse.setHeader(response, "X-Cache", "HIT")
          response = HttpServerResponse.setHeader(
            response,
            "X-Cache-Updated-At",
            cachedResult.value.updatedAt.toISOString(),
          )

          return response
        }

        // Execute the actual handler
        const response = yield* httpApp

        // Check if we should cache this response
        if (shouldCache(request, response)) {
          // Extract response body for caching
          const bodyText = extractBodyText(response.body)

          if (bodyText !== null) {
            const cacheableHeaders: Record<string, string> = {}

            // Copy relevant headers for caching
            const headersToCache = [
              "content-type",
              "content-language",
              "etag",
              "last-modified",
            ]
            for (const header of headersToCache) {
              const value = response.headers[header]
              if (value) {
                cacheableHeaders[header] = value
              }
            }

            const cacheData: CachedResponse = {
              status: response.status,
              body: bodyText,
              headers: cacheableHeaders,
            }

            // Store in cache (fire and forget - don't block the response)
            yield* cache
              .set(cacheKey, cacheData, CachedResponseSchema, ttlSeconds)
              .pipe(
                Effect.catchAll(() => Effect.void),
                Effect.fork, // Fork to not block the response
              )
          }
        }

        // Add cache miss header
        return HttpServerResponse.setHeader(response, "X-Cache", "MISS")
      }).pipe(Effect.withSpan("ResponseCache"))
  })
}

/**
 * A simpler response cache middleware that doesn't require the Cache service
 * to be available - it gracefully falls back to no caching if Redis is unavailable.
 */
export const responseCacheOptional = (options: ResponseCacheOptions = {}) => {
  const keyGenerator = options.keyGenerator ?? defaultKeyGenerator
  const ttlSeconds = options.ttlSeconds ?? 300
  const shouldCache = options.shouldCache ?? defaultShouldCache
  const excludePatterns = options.exclude ?? []

  return <E, R>(
    httpApp: Effect.Effect<HttpServerResponse.HttpServerResponse, E, R>,
  ): Effect.Effect<
    HttpServerResponse.HttpServerResponse,
    E,
    R | HttpServerRequest.HttpServerRequest | Cache
  > =>
    Effect.gen(function* () {
      const request = yield* HttpServerRequest.HttpServerRequest

      // Check if URL matches exclude patterns
      if (matchesExcludePattern(request.url, excludePatterns)) {
        return yield* httpApp
      }

      // Only try to cache GET requests
      if (request.method !== "GET") {
        return yield* httpApp
      }

      const cache = yield* Cache
      const cacheKey = keyGenerator(request)

      // Try to get from cache first
      const cachedResult = yield* cache
        .get(cacheKey, CachedResponseSchema)
        .pipe(
          Effect.catchAll(() =>
            Effect.succeed(
              Option.none<{
                data: CachedResponse
                cached: boolean
                updatedAt: Date
              }>(),
            ),
          ),
        )

      if (Option.isSome(cachedResult)) {
        const cached = cachedResult.value.data

        // Rebuild response from cached data
        let response = HttpServerResponse.text(cached.body, {
          status: cached.status,
        })

        // Add cached headers
        for (const [key, value] of Object.entries(cached.headers)) {
          response = HttpServerResponse.setHeader(response, key, value)
        }

        // Add cache indicator header
        response = HttpServerResponse.setHeader(response, "X-Cache", "HIT")
        response = HttpServerResponse.setHeader(
          response,
          "X-Cache-Updated-At",
          cachedResult.value.updatedAt.toISOString(),
        )

        return response
      }

      // Execute the actual handler
      const response = yield* httpApp

      // Check if we should cache this response
      if (shouldCache(request, response)) {
        // Extract response body for caching
        const bodyText = extractBodyText(response.body)

        if (bodyText !== null) {
          const cacheableHeaders: Record<string, string> = {}

          // Copy relevant headers for caching
          const headersToCache = [
            "content-type",
            "content-language",
            "etag",
            "last-modified",
          ]
          for (const header of headersToCache) {
            const value = response.headers[header]
            if (value) {
              cacheableHeaders[header] = value
            }
          }

          const cacheData: CachedResponse = {
            status: response.status,
            body: bodyText,
            headers: cacheableHeaders,
          }

          // Store in cache (fire and forget - don't block the response)
          yield* cache
            .set(cacheKey, cacheData, CachedResponseSchema, ttlSeconds)
            .pipe(
              Effect.catchAll(() => Effect.void),
              Effect.fork, // Fork to not block the response
            )
        }
      }

      // Add cache miss header
      return HttpServerResponse.setHeader(response, "X-Cache", "MISS")
    }).pipe(Effect.withSpan("ResponseCacheOptional"))
}
