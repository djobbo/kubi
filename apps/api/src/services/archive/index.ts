import { Database } from "@/services/db"
import { playerAliasesTable, playerHistoryTable } from "@dair/db"
import {
  and,
  eq,
  desc,
  like,
  sql,
  inArray,
  asc,
  or,
  lt,
  max,
} from "drizzle-orm"
import { Effect, Layer } from "effect"
import { BadRequest } from "@dair/api-contract/src/shared/errors"
import {
  SearchPlayerResponse,
  SearchPlayerItem,
} from "@dair/api-contract/src/routes/v1/brawlhalla/search-player"
import { NullOr } from "effect/Schema"

const MIN_ALIAS_SEARCH_LENGTH = 3
const MAX_ALIASES_PER_PLAYER = 10

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
        searchPlayers: Effect.fn("searchPlayers")(function* (
          name?: string,
          cursor?: {
            createdAt: Date
            id: string
          },
          pageSize = 10,
        ) {
          if (!name || name.length < MIN_ALIAS_SEARCH_LENGTH) {
            console.error("Name must be at least 3 characters long")
            return yield* Effect.fail(new BadRequest())
          }

          const latestPerIdSubquery = db.$with("latest_per_id").as(
            db
              .select({
                playerId: playerAliasesTable.playerId,
                maxDate: max(playerAliasesTable.createdAt).as("max_date"),
              })
              .from(playerAliasesTable)
              .where(like(playerAliasesTable.alias, `${name.toLowerCase()}%`))
              .groupBy(playerAliasesTable.playerId),
          )

          // Build the cursor condition
          const cursorCondition = cursor
            ? or(
                lt(playerAliasesTable.createdAt, cursor.createdAt),
                and(
                  eq(playerAliasesTable.createdAt, cursor.createdAt),
                  lt(playerAliasesTable.id, cursor.id),
                ),
              )
            : undefined

          // Main query
          const results = yield* db
            .with(latestPerIdSubquery)
            .select({
              id: playerAliasesTable.id,
              playerId: playerAliasesTable.playerId,
              name: playerAliasesTable.alias,
              createdAt: playerAliasesTable.createdAt,
              updatedAt: playerAliasesTable.updatedAt,
              public: playerAliasesTable.public,
            })
            .from(playerAliasesTable)
            .innerJoin(
              latestPerIdSubquery,
              and(
                eq(playerAliasesTable.playerId, latestPerIdSubquery.playerId),
                eq(playerAliasesTable.createdAt, latestPerIdSubquery.maxDate),
              ),
            )
            .where(
              and(
                like(playerAliasesTable.alias, `${name.toLowerCase()}%`),
                cursorCondition,
              ),
            )
            .orderBy(
              desc(playerAliasesTable.createdAt),
              desc(playerAliasesTable.id),
            )
            .limit(pageSize)

          const lastResult = results[results.length - 1]

          // Generate next cursor from last result
          const nextCursor =
            results.length === pageSize && lastResult
              ? {
                  createdAt: lastResult.createdAt,
                  id: lastResult.id,
                }
              : null

          return {
            data: results,
            nextCursor: nextCursor,
          }
        }),
      }
    }),
  },
) {
  static readonly layer = this.Default.pipe(Layer.provide(Database.layer))
}
