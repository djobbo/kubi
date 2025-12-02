import { DB } from "@/services/db"
import { ArchiveQueryError } from "./errors"
import { aliasesTable } from "@dair/schema"
import { and, eq } from "drizzle-orm"
import { Context, Effect, Layer } from "effect"

/**
 * Archive service for managing player aliases
 */
export class Archive extends Context.Tag("@app/Archive")<
  Archive,
  {
    readonly getAliases: (playerId: number) => Effect.Effect<
      Array<{
        playerId: string
        alias: string
        public: boolean
        createdAt: Date
      }>,
      ArchiveQueryError
    >
  }
>() {
  /**
   * Live layer for Archive service
   */
  static readonly layer = Layer.effect(
    Archive,
    Effect.gen(function* () {
      const db = yield* DB

      const service = {
        getAliases: (playerId: number) =>
          db
            .use(async (client) => {
              return await client
                .select()
                .from(aliasesTable)
                .where(
                  and(
                    eq(aliasesTable.playerId, playerId.toString()),
                    eq(aliasesTable.public, true),
                  ),
                )
                .execute()
            })
            .pipe(
              Effect.catchTags({
                DBQueryError: (error) =>
                  Effect.fail(
                    new ArchiveQueryError({
                      cause: error,
                      message: `Failed to get aliases for player ${playerId}`,
                    }),
                  ),
              }),
            ),
      }

      return Archive.of(service)
    }),
  ).pipe(Layer.provide(DB.layer))
}
