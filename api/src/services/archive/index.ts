import * as DB from "@/services/db"
import { ArchiveQueryError } from "./errors"
import { aliasesTable } from "@dair/schema"
import { and, eq } from "drizzle-orm"
import { Context, Effect, Layer } from "effect"

/**
 * Archive service interface
 */
export interface ArchiveService {
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

/**
 * Archive service tag for dependency injection
 */
export class Archive extends Context.Tag("Archive")<
  Archive,
  ArchiveService
>() {}

/**
 * Creates the Archive service implementation
 */
const makeArchive = Effect.gen(function* () {
  const db = yield* DB.DB

  const service: ArchiveService = {
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

  return service
})

/**
 * Live layer for Archive service
 * Requires: DB
 */
export const ArchiveLive = Layer.effect(Archive, makeArchive)
