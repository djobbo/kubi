import { rankedRegions } from "@dair/brawlhalla-api/src/constants/ranked/regions"
import {
	getLegendsAccumulativeData,
	getWeaponlessData,
	getWeaponsData,
	parsePlayerLegends,
} from "@dair/brawlhalla-api/src/helpers/parser"
import {
	getPersonalRatingReset,
	getSeasonStats,
} from "@dair/brawlhalla-api/src/helpers/season-reset"
import { getLegendOrTeamRatingReset } from "@dair/brawlhalla-api/src/helpers/season-reset"
import { getTeamPlayers } from "@dair/brawlhalla-api/src/helpers/team-players"
import { calculateWinrate } from "@dair/brawlhalla-api/src/helpers/winrate"
import {
	HttpApi,
	HttpApiBuilder,
	HttpApiEndpoint,
	HttpApiGroup,
	HttpApiSchema,
	HttpApiSwagger,
} from "@effect/platform"
import { BunHttpServer, BunRuntime } from "@effect/platform-bun"
import { Effect, Layer, Schema } from "effect"
import * as Archive from "./services/archive"
import * as BrawlhallaApi from "./services/brawlhalla-api"

import { cleanString } from "@dair/common/src/helpers/clean-string"
import * as Fetcher from "./helpers/fetcher"
import * as DB from "./services/db"

const idParam = HttpApiSchema.param("id", Schema.NumberFromString)

const Bookmark = Schema.Struct({
	// TODO: Add bookmark schema
})

const PlayerAliases = Schema.Array(Schema.String)

const PlayerStats = Schema.Struct({
	xp: Schema.Number,
	level: Schema.Number,
	xp_percentage: Schema.Number,
	games: Schema.Number,
	wins: Schema.Number,
	matchtime: Schema.Number,
	kos: Schema.Number,
	falls: Schema.Number,
	suicides: Schema.Number,
	team_kos: Schema.Number,
	damage_dealt: Schema.Number,
	damage_taken: Schema.Number,
})

const PlayerRanked1v1 = Schema.Struct({
	rating: Schema.Number,
	peak_rating: Schema.Number,
	tier: Schema.NullOr(Schema.String),
	wins: Schema.Number,
	games: Schema.Number,
	region: Schema.NullOr(Schema.String),
	rating_reset: Schema.Number,
})

const PlayerRanked2v2 = Schema.Struct({
	games: Schema.Number,
	wins: Schema.Number,
	average_peak_rating: Schema.Number,
	average_rating: Schema.Number,
	teams: Schema.Array(
		Schema.Struct({
			teammate: Schema.Struct({
				id: Schema.Number,
				name: Schema.String,
			}),
			rating: Schema.Number,
			peak_rating: Schema.Number,
			tier: Schema.NullOr(Schema.String),
			wins: Schema.Number,
			games: Schema.Number,
			region: Schema.NullOr(Schema.String),
			rating_reset: Schema.Number,
		}),
	),
})

const PlayerRankedRotating = Schema.Struct({
	rating: Schema.Number,
	peak_rating: Schema.Number,
	tier: Schema.NullOr(Schema.String),
	wins: Schema.Number,
	games: Schema.Number,
	region: Schema.NullOr(Schema.String),
})

const PlayerRanked = Schema.Struct({
	stats: Schema.Struct({
		games: Schema.Number,
		wins: Schema.Number,
		peak_rating: Schema.Number,
		glory: Schema.Struct({
			from_wins: Schema.Number,
			from_peak_rating: Schema.Number,
			total: Schema.Number,
		}),
	}),
	"1v1": Schema.NullOr(PlayerRanked1v1),
	"2v2": Schema.NullOr(PlayerRanked2v2),
	rotating: Schema.NullOr(PlayerRankedRotating),
})

const PlayerClan = Schema.Struct({
	id: Schema.Number,
	name: Schema.String,
	xp: Schema.Number,
	personal_xp: Schema.Number,
	rank: Schema.NullOr(Schema.String),
	joined_at: Schema.NullOr(Schema.Number),
	created_at: Schema.NullOr(Schema.Number),
	members_count: Schema.NullOr(Schema.Number),
	bookmark: Schema.NullOr(Bookmark),
})

const PlayerUnarmed = Schema.Struct({
	damage_dealt: Schema.Number,
	kos: Schema.Number,
	time_held: Schema.Number,
})

const PlayerWeaponThrows = Schema.Struct({
	damage_dealt: Schema.Number,
	kos: Schema.Number,
})

const PlayerGadget = Schema.Struct({
	damage_dealt: Schema.Number,
	kos: Schema.Number,
})

const PlayerGadgets = Schema.Struct({
	kos: Schema.Number,
	damage_dealt: Schema.Number,
	bomb: Schema.NullOr(PlayerGadget),
	mine: Schema.NullOr(PlayerGadget),
	spikeball: Schema.NullOr(PlayerGadget),
	sidekick: Schema.NullOr(PlayerGadget),
	snowball: Schema.NullOr(
		Schema.Struct({
			hits: Schema.Number,
			kos: Schema.Number,
		}),
	),
})

const PlayerWeaponLegend = Schema.Struct({
	id: Schema.Number,
	name: Schema.String,
	kos: Schema.Number,
	damage_dealt: Schema.Number,
	time_held: Schema.Number,
})

const PlayerWeapon = Schema.Struct({
	name: Schema.String,
	stats: Schema.Struct({
		games: Schema.Number,
		wins: Schema.Number,
		kos: Schema.Number,
		damage_dealt: Schema.Number,
		time_held: Schema.Number,
		level: Schema.Number,
		xp: Schema.Number,
	}),
	legends: Schema.Array(PlayerWeaponLegend),
})

const PlayerLegendWeapon = Schema.Struct({
	name: Schema.String,
	damage_dealt: Schema.Number,
	kos: Schema.Number,
	time_held: Schema.Number,
})

const PlayerLegend = Schema.Struct({
	id: Schema.Number,
	name: Schema.String,
	name_key: Schema.String,
	stats: Schema.Struct({
		xp: Schema.Number,
		level: Schema.Number,
		xp_percentage: Schema.Number,
		damage_dealt: Schema.Number,
		damage_taken: Schema.Number,
		kos: Schema.Number,
		falls: Schema.Number,
		suicides: Schema.Number,
		team_kos: Schema.Number,
		matchtime: Schema.Number,
		games: Schema.Number,
		wins: Schema.Number,
	}),
	weapon_one: PlayerLegendWeapon,
	weapon_two: PlayerLegendWeapon,
	unarmed: PlayerUnarmed,
	gadgets: PlayerGadget,
	weapon_throws: PlayerWeaponThrows,
	// TODO: Base Ranked here
	ranked: Schema.NullOr(
		Schema.Struct({
			rating: Schema.Number,
			peak_rating: Schema.Number,
			tier: Schema.NullOr(Schema.String),
			wins: Schema.Number,
			games: Schema.Number,
		}),
	),
})

const Player = Schema.Struct({
	id: Schema.Number,
	name: Schema.String,
	aliases: PlayerAliases,
	stats: PlayerStats,
	ranked: Schema.NullOr(PlayerRanked),
	clan: Schema.NullOr(PlayerClan),
	unarmed: PlayerUnarmed,
	weapon_throws: PlayerWeaponThrows,
	gadgets: PlayerGadgets,
	weapons: Schema.Array(PlayerWeapon),
	legends: Schema.Array(PlayerLegend),
	bookmark: Schema.NullOr(Bookmark),
})

const PlayerResponse = Schema.Struct({
	data: Player,
	meta: Schema.Struct({
		updatedAt: Schema.Date,
	}),
})

const Api = HttpApi.make("Api")
	.add(
		HttpApiGroup.make("Brawlhalla").add(
			HttpApiEndpoint.get("getPlayer")`/players/${idParam}`
				.addSuccess(PlayerResponse)
				.addError(BrawlhallaApi.BrawlhallaApiError)
				.addError(Archive.ArchiveError),
		),
	)
	.prefix("/brawlhalla")

const BrawlhallaLive = HttpApiBuilder.group(Api, "Brawlhalla", (handlers) =>
	handlers.handle("getPlayer", ({ path }) =>
		Effect.gen(function* () {
			const { id: playerId } = path
			const brawlhallaApi = yield* BrawlhallaApi.BrawlhallaApi
			const [playerStats, playerRanked, allLegends] = yield* Effect.all(
				[
					brawlhallaApi.playerStatsById(playerId).fetch(),
					brawlhallaApi.playerRankedById(playerId).fetch(),
					brawlhallaApi.allLegendsData().fetch(),
				],
				{ concurrency: 3 },
			)
			const clanId = playerStats.data.clan?.clan_id
			const archiveService = yield* Archive.Archive
			const [aliases, clan, [bookmark], [clanBookmark]] = yield* Effect.all([
				archiveService.getAliases(playerId),
				clanId ? brawlhallaApi.clanById(clanId).fetch() : Effect.succeed(null),
				Effect.succeed([null]), // TODO: bookmark service,
				Effect.succeed([null]), // TODO: bookmark service,
			])

			const aliasesData = [
				...new Set(
					aliases
						.toSorted((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
						.map((alias) => cleanString(alias.alias))
						.filter((alias) => alias !== name),
				),
			]

			// const bookmarksService = yield* BookmarksService.BookmarksService
			// const [
			//   aliases,
			//   clan,
			//   // [bookmark],
			//   // maybeClanBookmark
			// ] =
			// yield* Effect.all([
			// 		archiveService.getAliases(playerId),
			//     clanId ? brawlhallaApi.clanById(clanId).fetch() : null,
			// 		// bookmarksService.getBookmarksByPageIds(session?.user.id, [
			// 		// 	{ pageId: playerId, pageType: "player_stats" },
			// 		// ]),
			// 		// clanId
			// 		// 	? bookmarksService.getBookmarksByPageIds(session?.user.id, [
			// 		// 			{ pageId: clanId, pageType: "clan_stats" },
			// 		// 		])
			// 		// 	: null,
			// 	])

			const updatedAt =
				playerStats.updatedAt.getTime() > playerRanked.updatedAt.getTime()
					? playerStats.updatedAt
					: playerRanked.updatedAt

			const legends = parsePlayerLegends(
				playerStats.data.legends,
				playerRanked.data.legends,
				allLegends.data,
			)
			const accumulativeData = getLegendsAccumulativeData(legends)
			const weapons = getWeaponsData(legends)
			const { unarmed, gadgets, weapon_throws } = getWeaponlessData(legends)

			const name = playerStats.data.name
			const brawlhallaId = playerStats.data.brawlhalla_id

			const clanMember = clan?.data.clan.find(
				(member) => member.brawlhalla_id === brawlhallaId,
			)

			const seasonStats = getSeasonStats(playerRanked.data)
			const ranked2v2AccumulativeData = playerRanked.data["2v2"]?.reduce(
				({ totalWins, totalGames, totalRating, totalPeakRating }, team) => ({
					totalWins: totalWins + team.wins,
					totalGames: totalGames + team.games,
					totalRating: totalRating + team.rating,
					totalPeakRating: totalPeakRating + team.peak_rating,
				}),
				{
					totalWins: 0,
					totalGames: 0,
					totalRating: 0,
					totalPeakRating: 0,
				},
			)

			const ranked1v1: typeof PlayerRanked1v1.Encoded | null =
				playerRanked.data.games > 0
					? {
							rating: playerRanked.data.rating,
							peak_rating: playerRanked.data.peak_rating,
							tier: playerRanked.data.tier ?? "Valhallan",
							wins: playerRanked.data.wins,
							games: playerRanked.data.games,
							region: playerRanked.data.region?.toLowerCase() ?? null,
							rating_reset: getPersonalRatingReset(playerRanked.data.rating),
						}
					: null

			const ranked2v2: typeof PlayerRanked2v2.Encoded | null =
				playerRanked.data["2v2"] && playerRanked.data["2v2"].length > 0
					? {
							games: ranked2v2AccumulativeData.totalGames,
							wins: ranked2v2AccumulativeData.totalWins,
							average_peak_rating: calculateWinrate(
								ranked2v2AccumulativeData.totalPeakRating,
								ranked2v2AccumulativeData.totalGames,
							),
							average_rating: calculateWinrate(
								ranked2v2AccumulativeData.totalRating,
								ranked2v2AccumulativeData.totalGames,
							),
							teams: playerRanked.data["2v2"]
								.map((team) => {
									const players = getTeamPlayers(team)
									if (!players) return null
									const [player1, player2] = players

									const teammate =
										player1.id === brawlhallaId ? player2 : player1

									return {
										teammate,
										rating: team.rating,
										peak_rating: team.peak_rating,
										tier: team.tier ?? "Valhallan",
										wins: team.wins,
										games: team.games,
										region: team.region
											? (rankedRegions[team.region - 1] ?? null)
											: null,
										rating_reset: getLegendOrTeamRatingReset(team.rating),
									}
								})
								.filter((team) => !!team)
								.toSorted((teamA, teamB) => teamB.rating - teamA.rating),
						}
					: null

			const rotatingRanked: typeof PlayerRankedRotating.Encoded | null =
				playerRanked.data.rotating_ranked &&
				!Array.isArray(playerRanked.data.rotating_ranked) &&
				playerRanked.data.rotating_ranked.games > 0
					? {
							rating: playerRanked.data.rotating_ranked.rating,
							peak_rating: playerRanked.data.rotating_ranked.peak_rating,
							tier: playerRanked.data.rotating_ranked.tier,
							wins: playerRanked.data.rotating_ranked.wins,
							games: playerRanked.data.rotating_ranked.games,
							region:
								playerRanked.data.rotating_ranked.region?.toLowerCase() ?? null,
						}
					: null

			const ranked: typeof PlayerRanked.Encoded | null = playerRanked.data
				? {
						stats: {
							games: seasonStats.totalGames,
							wins: seasonStats.totalWins,
							peak_rating: seasonStats.bestRating,
							glory: {
								from_wins: seasonStats.gloryFromWins,
								from_peak_rating: seasonStats.gloryFromPeakRating,
								total: seasonStats.totalGlory,
							},
						},
						"1v1": ranked1v1,
						"2v2": ranked2v2,
						rotating: rotatingRanked,
					}
				: null

			const clanData: typeof PlayerClan.Encoded | null = playerStats.data.clan
				? {
						id: playerStats.data.clan.clan_id,
						name: playerStats.data.clan.clan_name,
						xp: Number.parseInt(playerStats.data.clan.clan_xp),
						personal_xp: playerStats.data.clan.personal_xp,
						joined_at: clanMember?.join_date ?? null,
						rank: clanMember?.rank ?? null,
						created_at: clan?.data.clan_create_date ?? null,
						members_count: clan?.data.clan.length ?? null,
						bookmark: clanBookmark ?? null,
					}
				: null

			const gadgetsData = {
				...gadgets,
				bomb: {
					damage_dealt: playerStats.data.damagebomb,
					kos: playerStats.data.kobomb,
				},
				mine: {
					damage_dealt: playerStats.data.damagemine,
					kos: playerStats.data.komine,
				},
				spikeball: {
					damage_dealt: playerStats.data.damagespikeball,
					kos: playerStats.data.kospikeball,
				},
				sidekick: {
					damage_dealt: playerStats.data.damagesidekick,
					kos: playerStats.data.kosidekick,
				},
				snowball: {
					hits: playerStats.data.hitsnowball,
					kos: playerStats.data.kosnowball,
				},
			}

			const playerData = {
				id: brawlhallaId,
				name,
				aliases: aliasesData,
				stats: {
					xp: playerStats.data.xp,
					level: playerStats.data.level,
					xp_percentage:
						playerStats.data.level === 100
							? 100
							: playerStats.data.xp_percentage,
					games: playerStats.data.games,
					wins: playerStats.data.wins,
					...accumulativeData,
				},
				ranked,
				clan: clanData,
				unarmed,
				weapon_throws,
				gadgets: gadgetsData,
				weapons: weapons.toSorted(
					(weaponA, weaponB) => weaponB.stats.xp - weaponA.stats.xp,
				),
				legends: legends.toSorted(
					(legendA, legendB) => legendB.stats.xp - legendA.stats.xp,
				),
				bookmark: bookmark ?? null,
			}

			return {
				data: playerData,
				meta: {
					updatedAt,
				},
			}
		}),
	),
)

const ApiLive = HttpApiBuilder.api(Api).pipe(Layer.provide(BrawlhallaLive))

const ServerLive = HttpApiBuilder.serve().pipe(
	Layer.provide(HttpApiSwagger.layer()),
	Layer.provide(ApiLive),
	Layer.provide(BunHttpServer.layer({ port: 3000 })),
	Layer.provide(BrawlhallaApi.fromEnv),
	Layer.provide(Archive.layer()),
	Layer.provide(Fetcher.fromEnv),
	Layer.provide(DB.fromEnv),
)

Layer.launch(ServerLive).pipe(BunRuntime.runMain)
