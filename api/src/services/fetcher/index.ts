import { Config } from "@/services/config"
import { DB } from "@/services/db"
import { CacheMissError, CacheWriteError } from "./errors"
import { apiCacheTable } from "@dair/schema"
import { HttpClient, HttpClientRequest } from "@effect/platform"
import type { HttpMethod } from "@effect/platform/HttpMethod"
import { and, desc, eq, gte } from "drizzle-orm"
import { Context, Effect, Layer, Schedule, Schema } from "effect"
import type { HttpBodyError } from "@effect/platform/HttpBody"
import type { ParseError } from "effect/ParseResult"
import type { TimeoutException } from "effect/Cause"
import type { HttpClientError } from "@effect/platform/HttpClientError"

const DEFAULT_RETRIES = 3
const DEFAULT_TIMEOUT = 10000
const DEFAULT_CACHE_MAX_AGE = 15 * 60 * 1000

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
      rawData: unknown
      data: T
      updatedAt: Date
      cached: boolean
    },
    HttpBodyError | ParseError | TimeoutException | HttpClientError,
    HttpClient.HttpClient
  >
  readonly fetchCache: <T, U>(
    schema: Schema.Schema<T, U>,
    options: FetchJsonOptions,
  ) => Effect.Effect<
    { data: T; updatedAt: Date; cached: boolean },
    CacheMissError | ParseError,
    DB | Config
  >
  readonly fetchRevalidate: <T, U>(
    schema: Schema.Schema<T, U>,
    options: FetchJsonOptions,
  ) => Effect.Effect<
    { data: T; updatedAt: Date; cached: boolean },
    ParseError | TimeoutException | HttpBodyError | HttpClientError,
    HttpClient.HttpClient | DB | Config
  >
}

/**
 * Fetcher service tag for dependency injection
 */
export class Fetcher extends Context.Tag("Fetcher")<
  Fetcher,
  FetcherService
>() {}

/**
 * Fetches data from cache
 */
const fetchCache = <T, U>(
  schema: Schema.Schema<T, U>,
  options: FetchJsonOptions,
) =>
  Effect.gen(function* () {
    const config = yield* Config
    const db = yield* DB
    const cacheVersion = config.db.cacheVersion
    const { cacheName, cacheMaxAge = DEFAULT_CACHE_MAX_AGE } = options

    if (!cacheName) {
      return yield* Effect.fail(
        new CacheMissError({
          cacheName: "unknown",
          message: "No cache name provided",
        }),
      )
    }

    const cached = yield* db
      .use(async (client) =>
        client
          .select()
          .from(apiCacheTable)
          .where(
            and(
              eq(apiCacheTable.cacheName, cacheName),
              eq(apiCacheTable.version, cacheVersion),
              gte(apiCacheTable.createdAt, new Date(Date.now() - cacheMaxAge)),
            ),
          )
          .orderBy(desc(apiCacheTable.createdAt))
          .limit(1)
          .execute(),
      )
      .pipe(
        Effect.andThen((rows) => rows[0]),
        Effect.catchTag("DBQueryError", (_error) =>
          Effect.fail(
            new CacheMissError({
              cacheName,
              message: "Database query failed when fetching from cache",
            }),
          ),
        ),
      )

    if (!cached) {
      return yield* Effect.fail(
        new CacheMissError({
          cacheName,
          message: "No cached data found",
        }),
      )
    }

    const parsed = yield* Schema.decodeUnknown(schema)(cached.data)

    return {
      data: parsed,
      updatedAt: cached.createdAt,
      cached: true,
    }
  }).pipe(Effect.withSpan("Fetcher.fetchCache"))

/**
 * Fetches JSON data from a URL
 */
const fetchJson = <T, U>(
  schema: Schema.Schema<T, U>,
  options: FetchJsonOptions,
) =>
  Effect.gen(function* () {
    const httpClient = yield* HttpClient.HttpClient
    const json = yield* HttpClientRequest.make(options.method)(
      options.url,
    ).pipe(
      Effect.fn(function* (request) {
        if (options.body) {
          return yield* request.pipe(HttpClientRequest.bodyJson(options.body))
        }
        return request
      }),
      Effect.flatMap(httpClient.execute),
      Effect.timeout(options.timeout ?? DEFAULT_TIMEOUT),
      Effect.retry({
        times: options.retries ?? DEFAULT_RETRIES,
        schedule: Schedule.exponential(1000),
      }),
      Effect.flatMap((res) => res.json),
    )

    const parsed = yield* Schema.decodeUnknown(schema)(json)

    return {
      rawData: json,
      data: parsed,
      updatedAt: new Date(),
      cached: false,
    }
  }).pipe(Effect.withSpan("Fetcher.fetchJson"))

/**
 * Caches data in the database
 */
const cache = <T, U>(
  schema: Schema.Schema<T, U>,
  options: FetchJsonOptions,
  rawData: unknown,
) =>
  Effect.gen(function* () {
    const config = yield* Config
    const db = yield* DB
    const cacheVersion = config.db.cacheVersion
    const { cacheName } = options
    if (!cacheName) return

    // Check if the raw data is valid for the schema
    yield* Schema.decodeUnknown(schema)(rawData)
    yield* db
      .use(async (client) => {
        await client
          .insert(apiCacheTable)
          .values({
            cacheName: cacheName,
            cacheId: `${cacheName}-${Date.now()}`,
            data: rawData,
            version: cacheVersion,
          })
          .onConflictDoNothing()
          .execute()
      })
      .pipe(
        Effect.catchTag("DBQueryError", (error) =>
          Effect.fail(
            new CacheWriteError({
              cacheName,
              cause: error,
              message: "Failed to write to cache",
            }),
          ),
        ),
      )
  }).pipe(Effect.withSpan("Fetcher.cache"))

/**
 * Creates the Fetcher service implementation
 */
const makeFetcher = () => {
  const service: FetcherService = {
    fetchJson,
    fetchCache,
    fetchRevalidate: <T, U>(
      schema: Schema.Schema<T, U>,
      options: FetchJsonOptions,
    ) =>
      fetchCache(schema, options).pipe(
        Effect.orElse(() =>
          fetchJson(schema, options).pipe(
            Effect.tap(({ rawData }) =>
              // TODO: Fire and forget cache operation
              cache(schema, options, rawData).pipe(
                Effect.catchAll((error) => Effect.logError(error)),
              ),
            ),
          ),
        ),
      ),
  }

  return Effect.succeed(service)
}

/**
 * Live layer for Fetcher service
 * Requires: Config, DB, HttpClient
 */
export const FetcherLive = Layer.effect(Fetcher, makeFetcher())
