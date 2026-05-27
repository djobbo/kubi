import { Context, Effect, Layer, Option } from "effect"

/**
 * Fetch strategy for BrawlhallaApi requests.
 * - "cache-first": Check cache first, only fetch on cache miss (default for frontend)
 * - "fetch-first": Always fetch fresh data, update cache (for workers)
 */
export type FetchStrategy = "cache-first" | "fetch-first"

/**
 * Context tag for the current request's fetch strategy.
 * This is set per-request by middleware based on the X-Worker-API-Key header.
 */
export class RequestFetchStrategy extends Context.Service<
  RequestFetchStrategy,
  FetchStrategy
>()("@dair/services/RequestFetchStrategy") {
  static readonly CacheFirst = Layer.succeed(this, "cache-first" as const)

  static readonly FetchFirst = Layer.succeed(this, "fetch-first" as const)
}

/**
 * Helper to get the current fetch strategy, defaulting to cache-first
 */
export const getFetchStrategy = Effect.serviceOption(
  RequestFetchStrategy,
).pipe(
  Effect.map((strategy) =>
    Option.getOrElse(strategy, () => "cache-first" as const),
  ),
)

/**
 * Check if the current request should use fetch-first strategy
 */
export const shouldUseFetchFirst = getFetchStrategy.pipe(
  Effect.map((strategy) => strategy === "fetch-first"),
)
