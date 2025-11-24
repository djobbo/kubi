import { DatabaseConfig } from "./config"
import { DBConnectionError, DBQueryError } from "./errors"
import * as schema from "@dair/schema"
import { Database } from "bun:sqlite"
import { drizzle } from "drizzle-orm/bun-sqlite"
import { Context, Effect, Layer } from "effect"

/**
 * Database client type
 */
export type DatabaseClient = ReturnType<typeof drizzle<typeof schema, Database>>

/**
 * DB service interface
 */
export interface DBService {
  readonly use: <T>(
    fn: (client: DatabaseClient) => Promise<T>,
  ) => Effect.Effect<T, DBQueryError>
}

/**
 * DB service tag for dependency injection
 */
export class DB extends Context.Tag("DB")<DB, DBService>() {}

/**
 * Creates the DB service implementation
 */
const makeDB = Effect.gen(function* () {
  const config = yield* DatabaseConfig

  // Acquire the database connection with proper resource management
  const db = yield* Effect.acquireRelease(
    Effect.tryPromise({
      try: async () => {
        const sqlite = new Database(config.url, { create: true })
        return drizzle(sqlite, { schema })
      },
      catch: (e) =>
        new DBConnectionError({
          cause: e,
          message: `Failed to connect to database at ${config.url}`,
        }),
    }),
    (db) =>
      Effect.sync(() => {
        try {
          db.$client.close()
        } catch (error) {
          console.error("Error closing database connection:", error)
        }
      }),
  )

  const service: DBService = {
    use: (fn) =>
      Effect.tryPromise({
        try: async () => await fn(db),
        catch: (e) =>
          new DBQueryError({
            cause: e,
            message: "Database query failed",
          }),
      }),
  }

  return service
})

/**
 * Live layer for DB service
 * Requires: DatabaseConfig
 */
export const DBLive = Layer.scoped(DB, makeDB).pipe(
  Layer.provide(DatabaseConfig.layer),
)
