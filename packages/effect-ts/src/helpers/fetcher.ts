import { apiCacheTable } from "@dair/schema"
import { desc, eq } from "drizzle-orm"
import { Config, Context, Data, Effect, Layer, Schedule, Schema } from "effect"
import { DB } from "../services/db"

export class FetcherError extends Data.TaggedError("FetcherError")<{
	cause?: unknown
	message?: string
}> {}

export class FetcherCacheError extends Data.TaggedError("FetcherCacheError")<{
	cause?: unknown
	message?: string
}> {}

interface FetcherImpl {
	fetchFresh: typeof fetchFresh
	fetchCache: ReturnType<typeof fetchCache>
	fetchRevalidate: ReturnType<typeof fetchRevalidate>
}
export class Fetcher extends Context.Tag("Fetcher")<Fetcher, FetcherImpl>() {}

type FetcherOptions = {
	cacheVersion: number
}

export const make = (options: FetcherOptions) => {
	return Effect.succeed(
		Fetcher.of({
			fetchFresh,
			fetchCache: fetchCache(options),
			fetchRevalidate: fetchRevalidate(options),
		}),
	)
}

export const layer = (options: FetcherOptions) =>
	Layer.scoped(Fetcher, make(options))

const DEFAULT_RETRIES = 3
const DEFAULT_TIMEOUT = 10000

type FetchJsonOptions = {
	retries?: number
	timeout?: number
	init?: RequestInit
	cacheName?: string
}

export const fetchJson = <T, U>(
	schema: Schema.Schema<T, U>,
	url: string,
	options: FetchJsonOptions = {},
) => {
	return Effect.gen(function* () {
		const response = yield* Effect.tryPromise({
			try: () =>
				fetch(url, options.init).then((res) => {
					if (!res.ok) {
						throw new Error(`HTTP error! status: ${res.status}`)
					}
					return res
				}),
			catch: (error) =>
				new FetcherError({ cause: error, message: "Failed to fetch JSON" }),
		})
		const data = yield* Effect.tryPromise({
			try: () => response.json(),
			catch: (error) =>
				new FetcherError({ cause: error, message: "Failed to parse JSON" }),
		})
		const parsed = yield* Schema.decodeUnknown(schema)(data)
		return { parsed, raw: data }
	}).pipe(
		Effect.retry({
			times: options.retries ?? DEFAULT_RETRIES,
			schedule: Schedule.exponential(1000),
		}),
		Effect.timeout(options.timeout ?? DEFAULT_TIMEOUT),
		Effect.withLogSpan("Fetcher.fetchJson"),
	)
}

export const fetchFresh = <T, U>(
	schema: Schema.Schema<T, U>,
	url: string,
	options: FetchJsonOptions = {},
) => {
	return Effect.gen(function* () {
		const response = yield* fetchJson(schema, url, options)
		return response.parsed
	})
}

export const fetchCache =
	(options: FetcherOptions) =>
	<T, U>(schema: Schema.Schema<T, U>, cacheName: string) => {
		return Effect.gen(function* () {
			const db = yield* DB
			const cacheVersion = options.cacheVersion
			if (!cacheName) {
				return yield* Effect.fail(
					new FetcherCacheError({ message: "No cache name provided" }),
				)
			}
			const hi = yield* db.use(async (client) => {
				const cached = await client
					.select()
					.from(apiCacheTable)
					.where(eq(apiCacheTable.cacheName, cacheName))
					.orderBy(desc(apiCacheTable.createdAt))
					.limit(1)
					.execute()

				return cached
			})
			const cached = hi[0]
			if (cached) {
				const data = yield* Schema.decodeUnknown(schema)(cached.data)
				return {
					data,
					updatedAt: cached.createdAt,
				}
			}

			return yield* Effect.fail(
				new FetcherCacheError({ message: "No cached data found" }),
			)
		})
	}

export const fetchRevalidate =
	(fetcherOptions: FetcherOptions) =>
	<T, U>(
		schema: Schema.Schema<T, U>,
		url: string,
		options: FetchJsonOptions = {},
	) => {
		return Effect.gen(function* () {
			const db = yield* DB
			const { cacheName } = options
			if (!cacheName) {
				return yield* Effect.fail(
					new FetcherCacheError({ message: "No cache name provided" }),
				)
			}
			const cached = yield* fetchCache(fetcherOptions)(schema, cacheName).pipe(
				Effect.catchAll((error) => Effect.succeed(null)),
			)
			if (cached) {
				return {
					...cached,
					cached: true,
				}
			}

			const response = yield* fetchJson(schema, url, options)
			yield* db.use(async (client) => {
				await client
					.insert(apiCacheTable)
					.values({
						cacheName,
						cacheId: `${cacheName}-${Date.now()}`,
						data: response.raw,
						version: fetcherOptions.cacheVersion,
					})
					.onConflictDoNothing()
					.execute()
			})

			return {
				data: response.parsed,
				updatedAt: new Date(),
				cached: false,
			}
		})
	}
