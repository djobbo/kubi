import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { Context, Effect, Layer, Schema } from "effect";

import * as schema from "@dair/schema";

export class DBError extends Schema.TaggedError<DBError>("DBError")("DBError", {
  cause: Schema.optional(Schema.Unknown),
  message: Schema.optional(Schema.String),
}) {}
export class DB extends Context.Tag("DB")<
  DB,
  {
    use: <T>(
      fn: (client: ReturnType<typeof drizzle<typeof schema, Database>>) => Promise<T>
    ) => Effect.Effect<T, DBError, never>;
  }
>() {}

type DBOptions = {
  url: string;
};

export const make = Effect.fn(function* (options: DBOptions) {
  const db = yield* Effect.acquireRelease(
    Effect.tryPromise({
      try: async () => {
        const sqlite = new Database(options.url, { create: true });
        return drizzle(sqlite, { schema });
      },
      catch: (e) => new DBError({ cause: e, message: "Error connecting" }),
    }),
    (db) => Effect.promise(async () => db.$client.close())
  );

  return DB.of({
    use: Effect.fn("DB.use")(function* (fn) {
        const result = yield* Effect.tryPromise({
          try: async () => await fn(db),
          catch: (e) => new DBError({ cause: e, message: "Error in `DB.use`" }),
        });
        return result;
      }),
  });
});

export const layer = (options: DBOptions) => Layer.scoped(DB, make(options));
