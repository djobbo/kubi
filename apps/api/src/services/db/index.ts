import { DatabaseConfig } from "./config"
import { DBConnectionError, DBQueryError } from "./errors"
import * as schema from "@dair/schema"
import type { worker } from "~/alchemy.run.ts"
import { drizzle } from "drizzle-orm/libsql"
import { Context, Effect, Layer } from "effect"

/**
 * Database client type
 */
export type DatabaseClient = ReturnType<
  typeof drizzle<typeof schema, (typeof worker.Env)["DATABASE"]>
>

/**
 * Database service for interacting with the SQLite database
 */
export class DB extends Context.Tag("@app/DB")<
  DB,
  {
    readonly use: <T>(
      fn: (client: DatabaseClient) => Promise<T>,
    ) => Effect.Effect<T, DBQueryError>
  }
>() {
  /**
   * Creates the DB service implementation
   */
  static readonly layer = Layer.scoped(
    DB,
    Effect.gen(function* () {
      const config = yield* DatabaseConfig

      // Acquire the database connection with proper resource management
      const db = yield* Effect.acquireRelease(
        Effect.tryPromise({
          try: async () => {
            return drizzle(config.database, { schema })
          },
          catch: (e) =>
            new DBConnectionError({
              cause: e,
              message: `Failed to connect to database`,
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

      // Service method using Effect.fn for better tracing
      const use = Effect.fn("DB.use")(function* <T>(
        fn: (client: DatabaseClient) => Promise<T>,
      ) {
        return yield* Effect.tryPromise({
          try: async () => await fn(db),
          catch: (e) =>
            new DBQueryError({
              cause: e,
              message: "Database query failed",
            }),
        })
      })

      return DB.of({ use })
    }),
  ).pipe(Layer.provide(DatabaseConfig.layer))
}
