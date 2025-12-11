import { Database } from "@/services/db"
import { ArchiveQueryError } from "./errors"
import { playerAliasesTable } from "@dair/db"
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
      const db = yield* Database

      const service = {
        getAliases: Effect.fn("getAliases")(function* (playerId: number) {
          return yield* db
            .select()
            .from(playerAliasesTable)
            .where(
              and(
                eq(playerAliasesTable.playerId, playerId),
                eq(playerAliasesTable.public, true),
              ),
            )
        }),
      }

      return Archive.of(service)
    }),
  )
}
