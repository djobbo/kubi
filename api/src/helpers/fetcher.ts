import { apiCacheTable } from "@dair/schema";
import { HttpClient, HttpClientRequest } from "@effect/platform";
import type { HttpMethod } from "@effect/platform/HttpMethod";
import { desc, eq, and, gte } from "drizzle-orm";
import { Config, Data, Effect, Schedule, Schema } from "effect";
import { DB } from "@/services/db";

export class FetcherCacheError extends Data.TaggedError("FetcherCacheError")<{
  cause?: unknown;
  message?: string;
}> {}

const DEFAULT_RETRIES = 3;
const DEFAULT_TIMEOUT = 10000;
const DEFAULT_CACHE_MAX_AGE = 15 * 60 * 1000;

type FetchJsonOptions = {
  method: HttpMethod;
  url: string;
  body?: unknown;
  retries?: number;
  timeout?: number;
  cacheName?: string;
  cacheMaxAge?: number;
};

const fetchCache = Effect.fn("Fetcher.fetchCache")(function* <T, U>(
  schema: Schema.Schema<T, U>,
  options: FetchJsonOptions
) {
  const db = yield* DB;
  const cacheVersion = yield* Config.number("DATABASE_CACHE_VERSION");
  const { cacheName, cacheMaxAge = DEFAULT_CACHE_MAX_AGE } = options;
  if (!cacheName) {
    return yield* Effect.fail(
      new FetcherCacheError({ message: "No cache name provided" })
    );
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
            gte(apiCacheTable.createdAt, new Date(Date.now() - cacheMaxAge))
          )
        )
        .orderBy(desc(apiCacheTable.createdAt))
        .limit(1)
        .execute()
    )
    .pipe(Effect.andThen((rows) => rows[0]));

  if (!cached) {
    return yield* Effect.fail(
      new FetcherCacheError({ message: "No cached data found" })
    );
  }

  const parsed = yield* Schema.decodeUnknown(schema)(
    cached.data
  )

  return {
    data: parsed,
    updatedAt: cached.createdAt,
    cached: true,
  };
});

const fetchJson = Effect.fn("Fetcher.fetchJson")(function* <T, U>(
  schema: Schema.Schema<T, U>,
  options: FetchJsonOptions
) {
  const client = yield* HttpClient.HttpClient;
  const json = yield* HttpClientRequest.make(options.method)(options.url).pipe(
   Effect.fn(function* (request) {
    if (options.body) {
      return yield* request.pipe(HttpClientRequest.bodyJson(options.body));
    }
    return request;
   }),
    Effect.flatMap(client.execute),
    Effect.timeout(options.timeout ?? DEFAULT_TIMEOUT),
    Effect.retry({
      times: options.retries ?? DEFAULT_RETRIES,
      schedule: Schedule.exponential(1000),
    }),
    Effect.flatMap((res) => res.json)
  );

  const parsed = yield* Schema.decodeUnknown(schema)(json);
  
  return {
    rawData: json,
    data: parsed,
    updatedAt: new Date(),
    cached: false,
  };
});

const cache = Effect.fn("Fetcher.cache")(function* <T, U>(
  schema: Schema.Schema<T, U>,
  options: FetchJsonOptions,
  rawData: unknown
) {
  const cacheVersion = yield* Config.number("DATABASE_CACHE_VERSION");
  const { cacheName } = options;
  if (!cacheName) return;

  const db = yield* DB;
  // Check if the raw data is valid for the schema
  yield* Schema.decodeUnknown(schema)(rawData);
  yield* db.use(async (client) => {
    await client
      .insert(apiCacheTable)
      .values({
        cacheName: cacheName,
        cacheId: `${cacheName}-${Date.now()}`,
        data: rawData,
        version: cacheVersion,
      })
      .onConflictDoNothing()
      .execute();
  });
});

export const fetchRevalidate = Effect.fn("Fetcher.fetchRevalidate")(function* <
  T,
  U
>(schema: Schema.Schema<T, U>, options: FetchJsonOptions) {
  const db = yield* DB;
  return yield* fetchCache(schema, options).pipe(
    Effect.orElse(() =>
      fetchJson(schema, options).pipe(
        Effect.tap(({ rawData }) =>
          // Fire and forget cache operation
          Effect.runFork(
            cache(schema, options, rawData).pipe(Effect.provideService(DB, db))
          )
        )
      )
    ),
    // Effect.cachedWithTTL(options.cacheMaxAge ?? DEFAULT_CACHE_MAX_AGE)
  );
});
