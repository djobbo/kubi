import { Database } from "@/services/db"
import {
  type NewClanHistory,
  type NewPlayerAliases,
  type NewPlayerHistory,
  type NewPlayerWeaponHistory,
  type NewPlayerLegendHistory,
  type NewRanked1v1History,
  type NewRanked2v2History,
  type NewRankedRotatingHistory,
  clanHistoryTable,
  playerAliasesTable,
  playerHistoryTable,
  playerLegendHistoryTable,
  playerWeaponHistoryTable,
  ranked1v1HistoryTable,
  ranked2v2HistoryTable,
  rankedRotatingHistoryTable,
} from "@dair/db"
import { and, eq, desc, or, lt, max, gte, count, ilike } from "drizzle-orm"
import { Effect, Layer } from "effect"
import { BadRequest } from "@dair/api-contract/src/shared/errors"
import type { BrawlhallaApiPlayerStats } from "../brawlhalla-api/schema/player-stats"
import type { BrawlhallaApiPlayerRanked } from "../brawlhalla-api/schema/player-ranked"
import type { Player } from "@dair/api-contract/src/routes/v1/brawlhalla/get-player-by-id"
import { ArchiveQueryError } from "./errors"
import type { BrawlhallaApiClan } from "../brawlhalla-api/schema/clan"
import type { Clan } from "@dair/api-contract/src/routes/v1/brawlhalla/get-guild-by-id"
import type { SearchPlayerCursor } from "@dair/api-contract/src/routes/v1/brawlhalla/search-player"
import type { GlobalPlayerRankingsOrderBy } from "@dair/api-contract/src/routes/v1/brawlhalla/get-player-rankings"
import { isNotNull } from "drizzle-orm"
import type { GlobalLegendRankingsOrderBy } from "@dair/api-contract/src/routes/v1/brawlhalla/get-legend-rankings"
import type { AnyRegion } from "@dair/api-contract/src/shared/region"
import type { GameDelta } from "@dair/api-contract/src/routes/v1/brawlhalla/get-ranked-queues"

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

          const [playerHistoryRow] = yield* db
            .insert(playerHistoryTable)
            .values(playerHistory)
            .returning({ id: playerHistoryTable.id })

          const playerHistoryId = playerHistoryRow?.id
          if (!playerHistoryId) {
            return yield* ArchiveQueryError.make({
              message: "Failed to add player history",
              cause: new Error("Player history ID is undefined"),
            })
          }
          yield* Effect.log(
            "Created player history for player: " + playerData.id,
          )

          yield* Effect.log(
            "Creating player legend history for player: " + playerData.id,
            playerData.legends.length,
          )
          const playerLegendsHistory =
            playerData.legends.map<NewPlayerLegendHistory>((legend) => ({
              playerHistoryId,
              playerId: playerData.id,
              playerName: playerData.name,
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
              playerHistoryId,
              playerId: playerData.id,
              playerName: playerData.name,
              weaponName: weapon.name,
              games: weapon.stats.games,
              wins: weapon.stats.wins,
              damageDealt: weapon.stats.damage_dealt,
              timeHeld: weapon.stats.time_held,
              xp: weapon.stats.xp,
              kos: weapon.stats.kos,
              losses: weapon.stats.games - weapon.stats.wins,
            }))

          const [legendRows, weaponRows] = yield* Effect.all(
            [
              db
                .insert(playerLegendHistoryTable)
                .values(playerLegendsHistory)
                .returning({ id: playerLegendHistoryTable.id }),
              db
                .insert(playerWeaponHistoryTable)
                .values(playerWeaponsHistory)
                .returning({ id: playerWeaponHistoryTable.id }),
            ],
            { concurrency: "unbounded" },
          ).pipe(
            Effect.tapError((error) => {
              return Effect.logError(
                "Error creating player legend or weapon history",
                error,
              )
            }),
          )

          const playerLegendHistoryId = legendRows[0]?.id
          const playerWeaponHistoryId = weaponRows[0]?.id

          if (!playerLegendHistoryId || !playerWeaponHistoryId) {
            return yield* ArchiveQueryError.make({
              message: "Failed to add player legend or weapon history",
              cause: new Error(
                "Player legend or weapon history ID is undefined",
              ),
            })
          }

          yield* Effect.log(
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
              .where(ilike(playerAliasesTable.alias, `${name}%`))
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
              and(ilike(playerAliasesTable.alias, `${name}%`), cursorCondition),
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
        getGlobalPlayerRankings: Effect.fn("getGlobalPlayerRankings")(
          function* (
            field: typeof GlobalPlayerRankingsOrderBy.Type,
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
                  eq(
                    playerHistoryTable.recordedAt,
                    latestPerIdSubquery.maxDate,
                  ),
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
          },
        ),
        getGlobalLegendRankings: Effect.fn("getGlobalLegendRankings")(
          function* (
            legendId: number,
            field: typeof GlobalLegendRankingsOrderBy.Type,
            offset = 0,
            limit = 10,
          ) {
            const latestPerIdSubquery = db.$with("latest_per_id").as(
              db
                .select({
                  playerId: playerLegendHistoryTable.playerId,
                  maxDate: max(playerLegendHistoryTable.recordedAt).as(
                    "max_date",
                  ),
                })
                .from(playerLegendHistoryTable)
                .groupBy(playerLegendHistoryTable.playerId)
                .where(
                  and(
                    eq(playerLegendHistoryTable.legendId, legendId),
                    isNotNull(playerLegendHistoryTable[field]),
                  ),
                ),
            )

            const results = yield* db
              .with(latestPerIdSubquery)
              .select()
              .from(playerLegendHistoryTable)
              .innerJoin(
                latestPerIdSubquery,
                and(
                  eq(
                    playerLegendHistoryTable.playerId,
                    latestPerIdSubquery.playerId,
                  ),
                  eq(
                    playerLegendHistoryTable.recordedAt,
                    latestPerIdSubquery.maxDate,
                  ),
                  eq(playerLegendHistoryTable.legendId, legendId),
                  isNotNull(playerLegendHistoryTable[field]),
                ),
              )
              .orderBy(
                desc(playerLegendHistoryTable[field]),
                desc(playerLegendHistoryTable.recordedAt),
                desc(playerLegendHistoryTable.id),
              )
              .limit(limit)
              .offset(offset)

            return results.map(
              (result) => result.brawlhalla_player_legend_history,
            )
          },
        ),
        getGlobalWeaponRankings: Effect.fn("getGlobalWeaponRankings")(
          function* (
            weaponName: string,
            field: keyof NewPlayerWeaponHistory,
            offset = 0,
            limit = 10,
          ) {
            const latestPerIdSubquery = db.$with("latest_per_id").as(
              db
                .select({
                  playerId: playerWeaponHistoryTable.playerId,
                  maxDate: max(playerWeaponHistoryTable.recordedAt).as(
                    "max_date",
                  ),
                })
                .from(playerWeaponHistoryTable)
                .groupBy(playerWeaponHistoryTable.playerId)
                .where(
                  and(
                    eq(playerWeaponHistoryTable.weaponName, weaponName),
                    isNotNull(playerWeaponHistoryTable[field]),
                  ),
                ),
            )

            const results = yield* db
              .with(latestPerIdSubquery)
              .select()
              .from(playerWeaponHistoryTable)
              .innerJoin(
                latestPerIdSubquery,
                and(
                  eq(
                    playerWeaponHistoryTable.playerId,
                    latestPerIdSubquery.playerId,
                  ),
                  eq(
                    playerWeaponHistoryTable.recordedAt,
                    latestPerIdSubquery.maxDate,
                  ),
                  eq(playerWeaponHistoryTable.weaponName, weaponName),
                  isNotNull(playerWeaponHistoryTable[field]),
                ),
              )
              .orderBy(
                desc(playerWeaponHistoryTable[field]),
                desc(playerWeaponHistoryTable.recordedAt),
                desc(playerWeaponHistoryTable.id),
              )
              .limit(limit)
              .offset(offset)

            return results.map(
              (result) => result.brawlhalla_player_weapon_history,
            )
          },
        ),
        // ===== Ranked History Methods =====

        /**
         * Add 1v1 ranked history entries from leaderboard data
         */
        addRanked1v1History: Effect.fn("addRanked1v1History")(function* (
          entries: NewRanked1v1History[],
        ) {
          if (entries.length === 0) return []
          return yield* db
            .insert(ranked1v1HistoryTable)
            .values(entries)
            .returning({ id: ranked1v1HistoryTable.id })
        }),

        /**
         * Add 2v2 ranked history entries from leaderboard data
         */
        addRanked2v2History: Effect.fn("addRanked2v2History")(function* (
          entries: NewRanked2v2History[],
        ) {
          if (entries.length === 0) return []
          return yield* db
            .insert(ranked2v2HistoryTable)
            .values(entries)
            .returning({ id: ranked2v2HistoryTable.id })
        }),

        /**
         * Add rotating ranked history entries from leaderboard data
         */
        addRankedRotatingHistory: Effect.fn("addRankedRotatingHistory")(
          function* (entries: NewRankedRotatingHistory[]) {
            if (entries.length === 0) return []
            return yield* db
              .insert(rankedRotatingHistoryTable)
              .values(entries)
              .returning({ id: rankedRotatingHistoryTable.id })
          },
        ),

        /**
         * Get players whose game count changed in the last N minutes.
         * Uses the dedicated ranked history tables for efficient lookups.
         * Returns players sorted by rating.
         */
        getRecentlyActiveRanked1v1Players: Effect.fn(
          "getRecentlyActiveRanked1v1Players",
        )(function* ({
          windowMinutes = 15,
          limit = 50,
          region,
        }: {
          windowMinutes?: number
          limit?: number
          region: typeof AnyRegion.Type
        }) {
          const now = new Date()
          const windowStart = new Date(now.getTime() - windowMinutes * 60000)

          const table = ranked1v1HistoryTable
          const latestInWindow = db.$with("latest_in_window").as(
            db
              .select({
                playerId: table.playerId,
                maxDate: max(table.recordedAt).as("max_date"),
              })
              .from(table)
              .where(
                and(
                  gte(table.recordedAt, windowStart),
                  eq(table.region, region),
                ),
              )
              .groupBy(table.playerId),
          )

          const latestRecords = yield* db
            .with(latestInWindow)
            .select({
              playerId: table.playerId,
              name: table.name,
              recordedAt: table.recordedAt,
              games: table.games,
              rating: table.rating,
              peakRating: table.peakRating,
              wins: table.wins,
              tier: table.tier,
              region: table.region,
            })
            .from(table)
            .innerJoin(
              latestInWindow,
              and(
                eq(table.playerId, latestInWindow.playerId),
                eq(table.recordedAt, latestInWindow.maxDate),
                eq(table.region, region),
              ),
            )

          if (latestRecords.length === 0) return []

          const previousRecordsQuery = yield* Effect.forEach(
            latestRecords,
            (latest) =>
              db
                .select({
                  playerId: table.playerId,
                  games: table.games,
                  wins: table.wins,
                  rating: table.rating,
                })
                .from(table)
                .where(
                  and(
                    eq(table.playerId, latest.playerId),
                    lt(table.recordedAt, latest.recordedAt),
                    eq(table.region, region),
                  ),
                )
                .orderBy(desc(table.recordedAt))
                .limit(1),
            { concurrency: 10 },
          )

          const previousRankMap = new Map<number, typeof GameDelta.Type>()
          for (const [index, result] of previousRecordsQuery.entries()) {
            const latestPlayer = latestRecords[index]
            if (result[0] && latestPlayer) {
              previousRankMap.set(latestPlayer.playerId, result[0])
            }
          }

          return latestRecords
            .filter((player) => {
              const previousRank = previousRankMap.get(player.playerId)
              return (
                previousRank !== undefined && player.games > previousRank.games
              )
            })
            .map((player) => {
              const previousRank = previousRankMap.get(player.playerId)

              return {
                playerId: player.playerId,
                name: player.name,
                rating: player.rating,
                peakRating: player.peakRating,
                games: player.games,
                wins: player.wins,
                tier: player.tier,
                region: player.region,
                gamesDelta: {
                  games: player.games - (previousRank?.games ?? 0),
                  wins: player.wins - (previousRank?.wins ?? 0),
                  rating: player.rating - (previousRank?.rating ?? 0),
                },
                lastSeenAt: player.recordedAt,
              }
            })
            .sort((a, b) => b.rating - a.rating)
            .slice(0, limit)
        }),
        getRecentlyActiveRanked2v2Players: Effect.fn(
          "getRecentlyActiveRanked2v2Players",
        )(function* ({
          windowMinutes = 15,
          limit = 50,
          region,
        }: {
          windowMinutes?: number
          limit?: number
          region: typeof AnyRegion.Type
        }) {
          const now = new Date()
          const windowStart = new Date(now.getTime() - windowMinutes * 60000)

          const table = ranked2v2HistoryTable
          const latestInWindow = db.$with("latest_in_window").as(
            db
              .select({
                playerIdOne: table.playerIdOne,
                playerIdTwo: table.playerIdTwo,
                maxDate: max(table.recordedAt).as("max_date"),
              })
              .from(table)
              .where(
                and(
                  gte(table.recordedAt, windowStart),
                  eq(table.region, region),
                ),
              )
              .groupBy(table.playerIdOne, table.playerIdTwo),
          )

          const latestRecords = yield* db
            .with(latestInWindow)
            .select({
              playerIdOne: table.playerIdOne,
              playerIdTwo: table.playerIdTwo,
              playerNameOne: table.playerNameOne,
              playerNameTwo: table.playerNameTwo,
              recordedAt: table.recordedAt,
              games: table.games,
              rating: table.rating,
              peakRating: table.peakRating,
              wins: table.wins,
              tier: table.tier,
              region: table.region,
            })
            .from(table)
            .innerJoin(
              latestInWindow,
              and(
                eq(table.playerIdOne, latestInWindow.playerIdOne),
                eq(table.playerIdTwo, latestInWindow.playerIdTwo),
                eq(table.recordedAt, latestInWindow.maxDate),
                eq(table.region, region),
              ),
            )

          if (latestRecords.length === 0) return []

          const previousRecordsQuery = yield* Effect.forEach(
            latestRecords,
            (latest) =>
              db
                .select({
                  playerIdOne: table.playerIdOne,
                  playerIdTwo: table.playerIdTwo,
                  games: table.games,
                  wins: table.wins,
                  rating: table.rating,
                })
                .from(table)
                .where(
                  and(
                    eq(table.playerIdOne, latest.playerIdOne),
                    eq(table.playerIdTwo, latest.playerIdTwo),
                    lt(table.recordedAt, latest.recordedAt),
                    eq(table.region, region),
                  ),
                )
                .orderBy(desc(table.recordedAt))
                .limit(1),
            { concurrency: 10 },
          )

          const previousRankMap = new Map<string, typeof GameDelta.Type>()
          for (const [index, result] of previousRecordsQuery.entries()) {
            const latestTeam = latestRecords[index]
            if (result[0] && latestTeam) {
              const key = `${latestTeam.playerIdOne}-${latestTeam.playerIdTwo}`
              previousRankMap.set(key, result[0])
            }
          }

          return latestRecords
            .filter((team) => {
              const key = `${team.playerIdOne}-${team.playerIdTwo}`
              const previousRank = previousRankMap.get(key)
              return (
                previousRank !== undefined && team.games > previousRank.games
              )
            })
            .map((team) => {
              const key = `${team.playerIdOne}-${team.playerIdTwo}`
              const previousRank = previousRankMap.get(key)
              return {
                playerIdOne: team.playerIdOne,
                playerIdTwo: team.playerIdTwo,
                playerNameOne: team.playerNameOne,
                playerNameTwo: team.playerNameTwo,
                rating: team.rating,
                peakRating: team.peakRating,
                games: team.games,
                wins: team.wins,
                tier: team.tier,
                region: team.region,
                gamesDelta: {
                  games: team.games - (previousRank?.games ?? 0),
                  wins: team.wins - (previousRank?.wins ?? 0),
                  rating: team.rating - (previousRank?.rating ?? 0),
                },
                lastSeenAt: team.recordedAt,
              }
            })
            .sort((a, b) => b.rating - a.rating)
            .slice(0, limit)
        }),
        getRecentlyActiveRankedRotatingPlayers: Effect.fn(
          "getRecentlyActiveRankedRotatingPlayers",
        )(function* ({
          windowMinutes = 15,
          limit = 50,
          region,
        }: {
          windowMinutes?: number
          limit?: number
          region: typeof AnyRegion.Type
        }) {
          const now = new Date()
          const windowStart = new Date(now.getTime() - windowMinutes * 60000)
          const table = rankedRotatingHistoryTable
          const latestInWindow = db.$with("latest_in_window").as(
            db
              .select({
                playerId: table.playerId,
                maxDate: max(table.recordedAt).as("max_date"),
              })
              .from(table)
              .where(
                and(
                  gte(table.recordedAt, windowStart),
                  eq(table.region, region),
                ),
              )
              .groupBy(table.playerId),
          )

          const latestRecords = yield* db
            .with(latestInWindow)
            .select({
              playerId: table.playerId,
              name: table.name,
              recordedAt: table.recordedAt,
              games: table.games,
              rating: table.rating,
              peakRating: table.peakRating,
              wins: table.wins,
              tier: table.tier,
              region: table.region,
            })
            .from(table)
            .innerJoin(
              latestInWindow,
              and(
                eq(table.playerId, latestInWindow.playerId),
                eq(table.recordedAt, latestInWindow.maxDate),
                eq(table.region, region),
              ),
            )

          if (latestRecords.length === 0) return []

          const previousRecordsQuery = yield* Effect.forEach(
            latestRecords,
            (latest) =>
              db
                .select({
                  playerId: table.playerId,
                  games: table.games,
                  wins: table.wins,
                  rating: table.rating,
                })
                .from(table)
                .where(
                  and(
                    eq(table.playerId, latest.playerId),
                    lt(table.recordedAt, latest.recordedAt),
                    eq(table.region, region),
                  ),
                )
                .orderBy(desc(table.recordedAt))
                .limit(1),
            { concurrency: 10 },
          )

          const previousRankMap = new Map<number, typeof GameDelta.Type>()
          for (const [index, result] of previousRecordsQuery.entries()) {
            const latestPlayer = latestRecords[index]
            if (result[0] && latestPlayer) {
              previousRankMap.set(latestPlayer.playerId, result[0])
            }
          }

          return latestRecords
            .filter((player) => {
              const previousRank = previousRankMap.get(player.playerId)
              return (
                previousRank !== undefined && player.games > previousRank.games
              )
            })
            .map((player) => {
              const previousRank = previousRankMap.get(player.playerId)
              return {
                playerId: player.playerId,
                name: player.name,
                rating: player.rating,
                peakRating: player.peakRating,
                games: player.games,
                wins: player.wins,
                tier: player.tier,
                region: player.region,
                gamesDelta: {
                  games: player.games - (previousRank?.games ?? 0),
                  wins: player.wins - (previousRank?.wins ?? 0),
                  rating: player.rating - (previousRank?.rating ?? 0),
                },
                lastSeenAt: player.recordedAt,
              }
            })
            .sort((a, b) => b.rating - a.rating)
            .slice(0, limit)
        }),

        /**
         * Search guilds by name with pagination.
         * Uses the clan history table for efficient lookups.
         */
        searchGuilds: Effect.fn("searchGuilds")(function* ({
          page = 1,
          limit = 50,
          name,
        }: {
          page?: number
          limit?: number
          name?: string | undefined
        }) {
          // Get latest record per clan
          const latestPerIdSubquery = db.$with("latest_per_id").as(
            db
              .select({
                clanId: clanHistoryTable.clanId,
                maxDate: max(clanHistoryTable.recordedAt).as("max_date"),
              })
              .from(clanHistoryTable)
              .where(
                name ? ilike(clanHistoryTable.name, `${name}%`) : undefined,
              )
              .groupBy(clanHistoryTable.clanId),
          )

          // Count total matching clans
          const totalResult = yield* db
            .with(latestPerIdSubquery)
            .select({ count: count() })
            .from(latestPerIdSubquery)

          // Get paginated results
          const results = yield* db
            .with(latestPerIdSubquery)
            .select({
              id: clanHistoryTable.id,
              clanId: clanHistoryTable.clanId,
              name: clanHistoryTable.name,
              xp: clanHistoryTable.xp,
              membersCount: clanHistoryTable.membersCount,
              createdDate: clanHistoryTable.createdDate,
              recordedAt: clanHistoryTable.recordedAt,
            })
            .from(clanHistoryTable)
            .innerJoin(
              latestPerIdSubquery,
              and(
                eq(clanHistoryTable.clanId, latestPerIdSubquery.clanId),
                eq(clanHistoryTable.recordedAt, latestPerIdSubquery.maxDate),
              ),
            )
            .orderBy(desc(clanHistoryTable.xp))
            .limit(limit)
            .offset((page - 1) * limit)

          return {
            clans: results,
            total: totalResult[0]?.count ?? null,
            page,
            limit,
            name,
          }
        }),
      }
    }),
  },
) {
  static readonly layer = this.Default.pipe(Layer.provide(Database.layer))
}
