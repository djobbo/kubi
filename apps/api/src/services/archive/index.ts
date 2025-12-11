import { Database } from "@/services/db"
import { playerAliasesTable } from "@dair/db"
import { and, eq } from "drizzle-orm"
import { Effect, Layer } from "effect"

export class Archive extends Effect.Service<Archive>()(
  "@dair/services/Archive",
  {
    effect: Effect.gen(function* () {
      const db = yield* Database

      return {
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
    }),
  },
) {
  static readonly layer = this.Default.pipe(Layer.provide(Database.layer))
}
