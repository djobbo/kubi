import { Context, Data, Effect, Layer, Schedule, Schema } from "effect"

export class FetcherError extends Data.TaggedError("FetcherError")<{
	cause?: unknown
	message?: string
}> {}

interface FetcherImpl {
	fetchFresh: typeof fetchFresh
	fetchCache: typeof fetchCache
	fetchRevalidate: typeof fetchRevalidate
}
export class Fetcher extends Context.Tag("Fetcher")<Fetcher, FetcherImpl>() {}

export const make = () => {
	return Effect.succeed(
		Fetcher.of({
			fetchFresh,
			fetchCache,
			fetchRevalidate,
		}),
	)
}

export const layer = () => Layer.scoped(Fetcher, make())

const DEFAULT_RETRIES = 3
const DEFAULT_TIMEOUT = 10000

type FetchJsonOptions = {
	retries?: number
	timeout?: number
	init?: RequestInit
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
		return parsed
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
		return response
	})
}

export const fetchCache = <T, U>(
	schema: Schema.Schema<T, U>,
	url: string,
	options: FetchJsonOptions = {},
	ttl: number = 1000 * 60 * 60 * 24,
) => {
	// TODO: Add cache and revalidation using DB Layer
	return Effect.gen(function* () {
		const response = yield* fetchJson(schema, url, options)
		return response
	})
}

export const fetchRevalidate = <T, U>(
	schema: Schema.Schema<T, U>,
	url: string,
	options: FetchJsonOptions = {},
	ttl: number = 1000 * 60 * 60 * 24,
) => {
	// TODO: Add cache and revalidation using DB Layer
	return Effect.gen(function* () {
		const response = yield* fetchJson(schema, url, options)
		return response
	})
}
