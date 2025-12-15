import { Database } from "@/services/db"
import {
  type NewClanHistory,
  type NewPlayerAliases,
  type NewPlayerHistory,
  type NewPlayerWeaponHistory,
  type NewPlayerLegendHistory,
  clanHistoryTable,
  playerAliasesTable,
  playerHistoryTable,
  playerLegendHistoryTable,
  playerWeaponHistoryTable,
} from "@dair/db"
import { and, eq, desc, like, or, lt, max } from "drizzle-orm"
import { Effect, Layer } from "effect"
import { BadRequest } from "@dair/api-contract/src/shared/errors"
import type { BrawlhallaApiPlayerStats } from "../brawlhalla-api/schema/player-stats"
import type { BrawlhallaApiPlayerRanked } from "../brawlhalla-api/schema/player-ranked"
import type { Player } from "@dair/api-contract/src/routes/v1/brawlhalla/get-player-by-id"
import { ArchiveQueryError } from "./errors"
import type { BrawlhallaApiClan } from "../brawlhalla-api/schema/clan"
import type { Clan } from "@dair/api-contract/src/routes/v1/brawlhalla/get-guild-by-id"
import type { SearchPlayerCursor } from "@dair/api-contract/src/routes/v1/brawlhalla/search-player"
import type { GlobalPlayerRankingsSortByParam } from "@dair/api-contract/src/routes/v1/brawlhalla/get-player-rankings"
import { isNotNull } from "drizzle-orm"

const MIN_ALIAS_SEARCH_LENGTH = 3

export class Archive extends Effect.Service<Archive>()(
  "@dair/services/Archive",
  {
    effect: Effect.gen(function* () {
      const db = yield* Database

      return {
        addAliases: Effect.fn("addAliases")(function* (
          aliases: NewPlayerAliases[],
        ) {
          const [aliasesId] = yield* db
            .insert(playerAliasesTable)
            .values(aliases)
            .returning({ id: playerAliasesTable.id })

          return aliasesId
        }),
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
        getPlayerHistory: Effect.fn("getPlayerHistory")(function* (
          playerId: number,
          limit = 10,
          offset = 0,
        ) {
          return yield* db
            .select()
            .from(playerHistoryTable)
            .where(eq(playerHistoryTable.playerId, playerId))
            .orderBy(desc(playerHistoryTable.recordedAt))
            .limit(limit)
            .offset(offset)
        }),
        addPlayerHistory: Effect.fn("addPlayerHistory")(function* (
          playerData: typeof Player.Type,
          rawStatsData: typeof BrawlhallaApiPlayerStats.Type,
          rawRankedData: typeof BrawlhallaApiPlayerRanked.Type,
        ) {
          const playerHistory: NewPlayerHistory = {
            playerId: playerData.id,
            rawRankedData: rawRankedData,
            rawStatsData: rawStatsData,
            name: playerData.name,
            xp: playerData.stats.xp,
            games: playerData.stats.games,
            wins: playerData.stats.wins,
            losses: playerData.stats.games - playerData.stats.wins,
            matchtime: playerData.stats.matchtime,
            kos: playerData.stats.kos,
            falls: playerData.stats.falls,
            suicides: playerData.stats.suicides,
            teamKos: playerData.stats.team_kos,
            damageDealt: playerData.stats.damage_dealt,
            damageTaken: playerData.stats.damage_taken,
            ...(playerData.ranked?.["1v1"]
              ? {
                  ranked1v1Rating: playerData.ranked?.["1v1"]?.rating,
                  ranked1v1PeakRating: playerData.ranked?.["1v1"]?.peak_rating,
                  ranked1v1Games: playerData.ranked?.["1v1"]?.games,
                  ranked1v1Wins: playerData.ranked?.["1v1"]?.wins,
                  ranked1v1Losses:
                    playerData.ranked?.["1v1"]?.games -
                    playerData.ranked?.["1v1"]?.wins,
                }
              : {}),
            ...(playerData.ranked?.["2v2"]
              ? {
                  ranked2v2Games: playerData.ranked?.["2v2"]?.games,
                  ranked2v2Wins: playerData.ranked?.["2v2"]?.wins,
                  ranked2v2Losses:
                    playerData.ranked?.["2v2"]?.games -
                    playerData.ranked?.["2v2"]?.wins,
                }
              : {}),
            ...(playerData.ranked?.rotating
              ? {
                  rankedRotatingRating: playerData.ranked?.rotating?.rating,
                  rankedRotatingPeakRating:
                    playerData.ranked?.rotating?.peak_rating,
                  rankedRotatingGames: playerData.ranked?.rotating?.games,
                  rankedRotatingWins: playerData.ranked?.rotating?.wins,
                  rankedRotatingLosses:
                    playerData.ranked?.rotating?.games -
                    playerData.ranked?.rotating?.wins,
                }
              : {}),
          }

          const [playerHistoryId] = yield* db
            .insert(playerHistoryTable)
            .values(playerHistory)
            .returning({ id: playerHistoryTable.id })

          if (!playerHistoryId) {
            return yield* ArchiveQueryError.make({
              message: "Failed to add player history",
              cause: new Error("Player history ID is undefined"),
            })
          }
          Effect.log("Created player history for player: " + playerData.id)

          Effect.log(
            "Creating player legend history for player: " + playerData.id,
            playerData.legends.length,
          )
          const playerLegendsHistory =
            playerData.legends.map<NewPlayerLegendHistory>((legend) => ({
              playerHistoryId: playerHistoryId.id,
              playerId: playerData.id,
              legendId: legend.id,
              games: legend.stats.games,
              wins: legend.stats.wins,
              losses: legend.stats.games - legend.stats.wins,
              xp: legend.stats.xp,
              damageDealt: legend.stats.damage_dealt,
              damageTaken: legend.stats.damage_taken,
              kos: legend.stats.kos,
              falls: legend.stats.falls,
              suicides: legend.stats.suicides,
              matchtime: legend.stats.matchtime,
              rating: legend.ranked?.rating,
              peakRating: legend.ranked?.peak_rating,
              tier: legend.ranked?.tier,
              teamKos: legend.stats.team_kos,
            }))
          const playerWeaponsHistory =
            playerData.weapons.map<NewPlayerWeaponHistory>((weapon) => ({
              playerHistoryId: playerHistoryId.id,
              playerId: playerData.id,
              weaponName: weapon.name,
              games: weapon.stats.games,
              wins: weapon.stats.wins,
              damageDealt: weapon.stats.damage_dealt,
              timeHeld: weapon.stats.time_held,
              xp: weapon.stats.xp,
              kos: weapon.stats.kos,
              losses: weapon.stats.games - weapon.stats.wins,
            }))

          const [playerLegendHistoryId, playerWeaponHistoryId] =
            yield* Effect.all(
              [
                db
                  .insert(playerLegendHistoryTable)
                  .values(playerLegendsHistory),
                db
                  .insert(playerWeaponHistoryTable)
                  .values(playerWeaponsHistory),
              ],
              { concurrency: "unbounded" },
            ).pipe(
              Effect.tapError((error) => {
                Effect.logError(
                  "Error creating player legend or weapon history",
                  error,
                )
                return Effect.succeed(null)
              }),
            )

          if (!playerLegendHistoryId || !playerWeaponHistoryId) {
            return yield* ArchiveQueryError.make({
              message: "Failed to add player legend or weapon history",
              cause: new Error(
                "Player legend or weapon history ID is undefined",
              ),
            })
          }

          Effect.log(
            "Created player legend and weapon history for player: " +
              playerData.id,
          )

          return {
            playerHistoryId,
            playerLegendHistoryId,
            playerWeaponHistoryId,
          }
        }),
        addGuildHistory: Effect.fn("addClanHistory")(function* (
          guildData: typeof Clan.Type,
          rawGuildData?: typeof BrawlhallaApiClan.Type,
        ) {
          const guildHistory: NewClanHistory = {
            clanId: guildData.id,
            name: guildData.name,
            xp: guildData.xp,
            lifetimeXp: guildData.lifetime_xp,
            membersCount: guildData.members.length,
            createdDate: guildData.created_at,
            rawData: rawGuildData,
          }

          const [clanHistoryId] = yield* db
            .insert(clanHistoryTable)
            .values(guildHistory)
            .returning({ id: clanHistoryTable.id })

          return clanHistoryId
        }),
        searchPlayers: Effect.fn("searchPlayers")(function* (
          name?: string,
          cursor?: typeof SearchPlayerCursor.Type,
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
                maxDate: max(playerAliasesTable.recordedAt).as("max_date"),
              })
              .from(playerAliasesTable)
              .where(like(playerAliasesTable.alias, `${name.toLowerCase()}%`))
              .groupBy(playerAliasesTable.playerId),
          )

          // Build the cursor condition
          const cursorCondition = cursor
            ? or(
                lt(playerAliasesTable.recordedAt, cursor.recordedAt),
                and(
                  eq(playerAliasesTable.recordedAt, cursor.recordedAt),
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
              recordedAt: playerAliasesTable.recordedAt,
              public: playerAliasesTable.public,
            })
            .from(playerAliasesTable)
            .innerJoin(
              latestPerIdSubquery,
              and(
                eq(playerAliasesTable.playerId, latestPerIdSubquery.playerId),
                eq(playerAliasesTable.recordedAt, latestPerIdSubquery.maxDate),
              ),
            )
            .where(
              and(
                like(playerAliasesTable.alias, `${name.toLowerCase()}%`),
                cursorCondition,
              ),
            )
            .orderBy(
              desc(playerAliasesTable.recordedAt),
              desc(playerAliasesTable.id),
            )
            .limit(pageSize)

          const lastResult = results[results.length - 1]

          // Generate next cursor from last result
          const nextCursor =
            results.length === pageSize && lastResult
              ? {
                  recordedAt: lastResult.recordedAt,
                  id: lastResult.id,
                }
              : null

          return {
            data: results,
            nextCursor: nextCursor,
          }
        }),
        getPlayerRankings: Effect.fn("getPlayerRankings")(function* (
          field: typeof GlobalPlayerRankingsSortByParam.Type,
          offset = 0,
          limit = 10,
        ) {
          const latestPerIdSubquery = db.$with("latest_per_id").as(
            db
              .select({
                playerId: playerHistoryTable.playerId,
                maxDate: max(playerHistoryTable.recordedAt).as("max_date"),
              })
              .from(playerHistoryTable)
              .groupBy(playerHistoryTable.playerId)
              .where(isNotNull(playerHistoryTable[field])),
          )

          const results = yield* db
            .with(latestPerIdSubquery)
            .select()
            .from(playerHistoryTable)
            .innerJoin(
              latestPerIdSubquery,
              and(
                eq(playerHistoryTable.playerId, latestPerIdSubquery.playerId),
                eq(playerHistoryTable.recordedAt, latestPerIdSubquery.maxDate),
              ),
            )
            .orderBy(
              desc(playerHistoryTable[field]),
              desc(playerHistoryTable.recordedAt),
              desc(playerHistoryTable.id),
            )
            .limit(limit)
            .offset(offset)

          return results.map((result) => result.brawlhalla_player_history)
        }),
        getLegendRankings: Effect.fn("getLegendRankings")(function* (
          legendId: number,
          field: keyof NewPlayerLegendHistory,
          offset = 0,
          limit = 10,
        ) {
          // Use same thing as searchPlayers but for legends with field, and with offset and limit instead of cursor
          return yield* db
            .select()
            .from(playerLegendHistoryTable)
            .where(eq(playerLegendHistoryTable.legendId, legendId))
            .groupBy(playerLegendHistoryTable.playerId)
            .orderBy(
              desc(playerLegendHistoryTable[field]),
              desc(playerLegendHistoryTable.recordedAt),
              desc(playerLegendHistoryTable.id),
            )
            .limit(limit)
            .offset(offset)
        }),
        getWeaponRankings: Effect.fn("getWeaponRankings")(function* (
          weaponName: string,
          field: keyof NewPlayerWeaponHistory,
          offset = 0,
          limit = 10,
        ) {
          // Use same thing as searchPlayers but for legends with field, and with offset and limit instead of cursor
          return yield* db
            .select()
            .from(playerWeaponHistoryTable)
            .where(eq(playerWeaponHistoryTable.weaponName, weaponName))
            .groupBy(playerWeaponHistoryTable.playerId)
            .orderBy(
              desc(playerWeaponHistoryTable[field]),
              desc(playerLegendHistoryTable.recordedAt),
              desc(playerLegendHistoryTable.id),
            )
            .limit(limit)
            .offset(offset)
        }),
      }
    }),
  },
) {
  static readonly layer = this.Default.pipe(Layer.provide(Database.layer))
}
