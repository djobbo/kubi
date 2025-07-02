import { Database } from "bun:sqlite"
import { drizzle } from "drizzle-orm/bun-sqlite"
import { Config, Context, Data, Effect, Layer, Schema } from "effect"

import * as schema from "@dair/schema"

export class DBError extends Data.TaggedError("DBError")<{
	cause?: unknown
	message?: string
}> {}

interface DBImpl {
	use: <T>(
		fn: (client: ReturnType<typeof drizzle<typeof schema, Database>>) => T,
	) => Effect.Effect<Awaited<T>, DBError, never>
}
export class DB extends Context.Tag("DB")<DB, DBImpl>() {}

type DBOptions = {
	url: string
}

export const make = (options: DBOptions) =>
	Effect.gen(function* () {
		const db = yield* Effect.acquireRelease(
			Effect.tryPromise({
				try: async () => {
					const sqlite = new Database(options.url, { create: true })
					return drizzle(sqlite, { schema })
				},
				catch: (e) => new DBError({ cause: e, message: "Error connecting" }),
			}),
			(db) => Effect.promise(async () => db.$client.close()),
		)
		return DB.of({
			use: (fn) =>
				Effect.gen(function* () {
					const result = yield* Effect.try({
						try: () => fn(db),
						catch: (e) =>
							new DBError({
								cause: e,
								message: "Syncronous error in `DB.use`",
							}),
					})
					if (result instanceof Promise) {
						return yield* Effect.tryPromise({
							try: () => result,
							catch: (e) =>
								new DBError({
									cause: e,
									message: "Asyncronous error in `DB.use`",
								}),
						})
					}
					return result
				}),
		})
	})

export const layer = (options: DBOptions) => Layer.scoped(DB, make(options))

export const fromEnv = Layer.scoped(
	DB,
	Effect.gen(function* () {
		const url = yield* Config.string("DATABASE_URL")
		return yield* make({ url })
	}),
)
