import { getIp } from "@/helpers/get-ip"
import HttpStatus from "@/helpers/http-status"
import { jsonContent, jsonErrorContent } from "@/helpers/json-content"
import { optionalAuthMiddleware } from "@/middlewares/auth-middleware"
import { archiveService } from "@/services/archive"
import { bookmarksService } from "@/services/bookmarks/bookmarks-service"
import { brawlhallaGqlService } from "@/services/brawlhalla-gql/brawlhalla-gql-service"
import { brawlhallaService } from "@/services/brawlhalla/brawlhalla-service"
import { brawltoolsService } from "@/services/brawltools/brawltools-service"
import { getRegion } from "@/services/locate"
import type { PowerRankingsGameMode } from "@dair/brawlhalla-api/src/constants/power/game-mode"
import type {
	PowerRankingsOrder,
	PowerRankingsOrderBy,
} from "@dair/brawlhalla-api/src/constants/power/order-by"
import { rankedRegions } from "@dair/brawlhalla-api/src/constants/ranked/regions"
import {
	getLegendsAccumulativeData,
	getWeaponlessData,
	getWeaponsData,
	parsePlayerLegends,
} from "@dair/brawlhalla-api/src/helpers/parser"
import {
	getLegendOrTeamRatingReset,
	getPersonalRatingReset,
	getSeasonStats,
} from "@dair/brawlhalla-api/src/helpers/season-reset"
import { getTeamPlayers } from "@dair/brawlhalla-api/src/helpers/team-players"
import { calculateWinrate } from "@dair/brawlhalla-api/src/helpers/winrate"
import { cleanString } from "@dair/common/src/helpers/clean-string"
import { OpenAPIHono as Hono, createRoute, z } from "@hono/zod-openapi"

export const brawlhallaRoute = new Hono()
	// GET /brawlhalla/players/search - Search for players by name
	.openapi(
		createRoute({
			method: "get",
			path: "/players/search",
			description: "Search for players by name",
			summary: "Search for players by name",
			tags: ["Brawlhalla"],
			request: {
				query: z.object({
					name: z
						.string()
						.min(3, "Name parameter must be at least 3 characters long"),
				}),
			},
			responses: {
				[HttpStatus.OK]: jsonContent(
					z.object({
						data: z.array(z.any()),
						meta: z.object({
							query: z.string(),
							count: z.number(),
							timestamp: z.string(),
						}),
					}),
					"Successful response",
				),
				[HttpStatus.BAD_REQUEST]: jsonErrorContent(
					["INVALID_SEARCH_PARAMETER"] as const,
					"Bad request - missing or invalid search parameter",
				),
				[HttpStatus.INTERNAL_SERVER_ERROR]: jsonErrorContent(
					["SEARCH_PLAYERS_FAILED"] as const,
					"Failed to search players",
				),
			},
			middleware: optionalAuthMiddleware,
		}),
		async (c) => {
			try {
				const { name } = c.req.valid("query")
				const aliases = await archiveService.searchAliases(name)

				return c.json(
					{
						data: aliases,
						meta: {
							query: name,
							count: aliases.length,
							timestamp: new Date().toISOString(),
						},
					},
					HttpStatus.OK,
				)
			} catch (error) {
				console.error("Error searching players:", error)
				return c.json(
					{
						error: {
							code: "SEARCH_PLAYERS_FAILED" as const,
							message: "Failed to search players",
							details: ["An error occurred while searching for players"],
						},
					},
					HttpStatus.INTERNAL_SERVER_ERROR,
				)
			}
		},
	)

	// GET /brawlhalla/players/:playerId - Get player stats and ranked data
	.openapi(
		createRoute({
			method: "get",
			path: "/players/{playerId}",
			description: "Get player stats and ranked data by player ID",
			summary: "Get player stats and ranked data by player ID",
			tags: ["Brawlhalla"],
			request: {
				params: z.object({
					playerId: z.string(),
				}),
			},
			responses: {
				[HttpStatus.OK]: jsonContent(
					z.object({
						data: z.object({
							id: z.number(),
							name: z.string(),
							aliases: z.array(z.string()),
							stats: z.object({
								xp: z.number(),
								level: z.number(),
								xp_percentage: z.number(),
								games: z.number(),
								wins: z.number(),
								matchtime: z.number(),
								kos: z.number(),
								falls: z.number(),
								suicides: z.number(),
								team_kos: z.number(),
								damage_dealt: z.number(),
								damage_taken: z.number(),
							}),
							ranked: z
								.object({
									stats: z.object({
										games: z.number(),
										wins: z.number(),
										peak_rating: z.number(),
										glory: z.object({
											from_wins: z.number(),
											from_peak_rating: z.number(),
											total: z.number(),
										}),
									}),
									"1v1": z
										.object({
											rating: z.number(),
											peak_rating: z.number(),
											tier: z.string(), // TODO: typesafe tier
											wins: z.number(),
											games: z.number(),
											region: z.string(), // TODO: typesafe region
										})
										.nullable(),
									"2v2": z
										.object({
											games: z.number(),
											wins: z.number(),
											average_peak_rating: z.number(),
											average_rating: z.number(),
											teams: z.array(
												z.object({
													teammate: z.object({
														id: z.number(),
														name: z.string(),
													}),
													rating: z.number(),
													peak_rating: z.number(),
													tier: z.string(), // TODO: typesafe tier
													wins: z.number(),
													games: z.number(),
													region: z.string(), // TODO: typesafe region
													rating_reset: z.number(),
												}),
											),
										})
										.nullable(),
									"3v3": z.null(),
									rotating: z
										.object({
											rating: z.number(),
											peak_rating: z.number(),
											tier: z.string(), // TODO: typesafe tier
											wins: z.number(),
											games: z.number(),
											region: z.string(), // TODO: typesafe region
										})
										.nullable(),
								})
								.nullable(),
							clan: z
								.object({
									id: z.number(),
									name: z.string(),
									xp: z.number(),
									personal_xp: z.number(),
									rank: z.string().nullable(),
									joined_at: z.number().nullable(),
									created_at: z.number().nullable(),
									members_count: z.number().nullable(),
									bookmark: z.any().nullable(),
								})
								.nullable(),
							unarmed: z.object({
								damage_dealt: z.number(),
								kos: z.number(),
								time_held: z.number(),
							}),
							weapon_throws: z.object({
								damage_dealt: z.number(),
								kos: z.number(),
							}),
							gadgets: z.object({
								kos: z.number(),
								damage_dealt: z.number(),
								bomb: z.object({
									damage_dealt: z.number(),
									kos: z.number(),
								}),
								mine: z.object({
									damage_dealt: z.number(),
									kos: z.number(),
								}),
								spikeball: z.object({
									damage_dealt: z.number(),
									kos: z.number(),
								}),
								sidekick: z.object({
									damage_dealt: z.number(),
									kos: z.number(),
								}),
								snowball: z.object({
									hits: z.number(),
									kos: z.number(),
								}),
							}),
							weapons: z.array(
								z.object({
									name: z.string(),
									stats: z.object({
										games: z.number(),
										wins: z.number(),
										kos: z.number(),
										damage_dealt: z.number(),
										time_held: z.number(),
										level: z.number(),
										xp: z.number(),
									}),
									legends: z.array(
										z.object({
											id: z.number(),
											name: z.string(),
											kos: z.number(),
											damage_dealt: z.number(),
											time_held: z.number(),
										}),
									),
								}),
							),
							legends: z.array(
								z.object({
									id: z.number(),
									name: z.string(),
									name_key: z.string(),
									stats: z.object({
										xp: z.number(),
										level: z.number(),
										xp_percentage: z.number(),
										damage_dealt: z.number(),
										damage_taken: z.number(),
										kos: z.number(),
										falls: z.number(),
										suicides: z.number(),
										team_kos: z.number(),
										matchtime: z.number(),
										games: z.number(),
										wins: z.number(),
									}),
									weapon_one: z.object({
										name: z.string(), // TODO: typesafe weapon
										damage_dealt: z.number(),
										kos: z.number(),
										time_held: z.number(),
									}),
									weapon_two: z.object({
										name: z.string(), // TODO: typesafe weapon
										damage_dealt: z.number(),
										kos: z.number(),
										time_held: z.number(),
									}),
									unarmed: z.object({
										damage_dealt: z.number(),
										kos: z.number(),
										time_held: z.number(),
									}),
									gadgets: z.object({
										damage_dealt: z.number(),
										kos: z.number(),
									}),
									weapon_throws: z.object({
										damage_dealt: z.number(),
										kos: z.number(),
									}),
									ranked: z
										.object({
											rating: z.number(),
											peak_rating: z.number(),
											tier: z.string(), // TODO: typesafe tier
											wins: z.number(),
											games: z.number(),
										})
										.nullable(),
								}),
							),
							bookmark: z.any().nullable(),
						}),
						meta: z.object({
							playerId: z.string(),
							updatedAt: z.date(),
							timestamp: z.string(),
						}),
					}),
					"Player stats and ranked data retrieved successfully",
				),
				[HttpStatus.NOT_FOUND]: jsonErrorContent(
					["PLAYER_NOT_FOUND"] as const,
					"Player not found",
				),
			},
			middleware: optionalAuthMiddleware,
		}),
		async (c) => {
			try {
				const { playerId } = c.req.param()
				const playerStatsPromise =
					brawlhallaService.getPlayerStatsById(playerId)
				const playerRankedPromise =
					brawlhallaService.getPlayerRankedById(playerId)
				const allLegendsPromise = brawlhallaService.getAllLegendsData()
				const [stats, ranked, allLegends] = await Promise.all([
					playerStatsPromise,
					playerRankedPromise,
					allLegendsPromise,
				])
				const session = c.get("session")
				const clanId = stats.data.clan?.clan_id.toString()
				const [aliases, [bookmark], clan, maybeClanBookmark] =
					await Promise.all([
						archiveService.getAliases(playerId),
						bookmarksService.getBookmarksByPageIds(session?.user.id, [
							{ pageId: playerId, pageType: "player_stats" },
						]),
						clanId ? brawlhallaService.getClanById(clanId) : null,
						clanId
							? bookmarksService.getBookmarksByPageIds(session?.user.id, [
									{ pageId: clanId, pageType: "clan_stats" },
								])
							: null,
					])
				const updatedAt =
					stats.updatedAt.getTime() > ranked.updatedAt.getTime()
						? stats.updatedAt
						: ranked.updatedAt

				const legends = parsePlayerLegends(
					stats.data.legends,
					ranked.data.legends,
					allLegends.data,
				)
				const accumulativeData = getLegendsAccumulativeData(legends)
				const weapons = getWeaponsData(legends)
				const { unarmed, gadgets, weapon_throws } = getWeaponlessData(legends)

				const name = cleanString(stats.data.name)
				const brawlhallaId = stats.data.brawlhalla_id

				const clanMember = clan?.data.clan.find(
					(member) => member.brawlhalla_id === brawlhallaId,
				)

				const seasonStats = getSeasonStats(ranked.data)
				const ranked2v2AccumulativeData = ranked.data["2v2"]?.reduce(
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

				return c.json(
					{
						data: {
							id: brawlhallaId,
							name,
							aliases: [
								...new Set(
									aliases
										.toSorted(
											(a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
										)
										.map((alias) => cleanString(alias.alias))
										.filter((alias) => alias !== name),
								),
							],
							stats: {
								xp: stats.data.xp,
								level: stats.data.level,
								xp_percentage: stats.data.xp_percentage,
								games: stats.data.games,
								wins: stats.data.wins,
								...accumulativeData,
							},
							ranked: ranked.data
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
										"1v1": {
											rating: ranked.data.rating,
											peak_rating: ranked.data.peak_rating,
											tier: ranked.data.tier ?? "Valhallan",
											wins: ranked.data.wins,
											games: ranked.data.games,
											region: ranked.data.region.toLowerCase(),
											rating_reset: getPersonalRatingReset(ranked.data.rating),
										},
										"2v2": ranked.data["2v2"]
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
													teams: ranked.data["2v2"]
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
																region: rankedRegions[team.region - 1] ?? "all",
																rating_reset: getLegendOrTeamRatingReset(
																	team.rating,
																),
															}
														})
														.filter((team) => !!team)
														.toSorted(
															(teamA, teamB) => teamB.rating - teamA.rating,
														),
												}
											: null,
										"3v3": null,
										rotating:
											ranked.data.rotating_ranked &&
											!Array.isArray(ranked.data.rotating_ranked)
												? {
														rating: ranked.data.rotating_ranked.rating,
														peak_rating:
															ranked.data.rotating_ranked.peak_rating,
														tier: ranked.data.rotating_ranked.tier,
														wins: ranked.data.rotating_ranked.wins,
														games: ranked.data.rotating_ranked.games,
														region:
															ranked.data.rotating_ranked.region.toLowerCase(),
													}
												: null,
									}
								: null,
							clan: stats.data.clan
								? {
										id: stats.data.clan.clan_id,
										name: stats.data.clan.clan_name,
										xp: Number.parseInt(stats.data.clan.clan_xp),
										personal_xp: stats.data.clan.personal_xp,
										joined_at: clanMember?.join_date ?? null,
										rank: clanMember?.rank ?? null,
										created_at: clan?.data.clan_create_date ?? null,
										members_count: clan?.data.clan.length ?? null,
										bookmark: maybeClanBookmark?.[0] ?? null,
									}
								: null,
							unarmed,
							weapon_throws,
							gadgets: {
								...gadgets,
								bomb: {
									damage_dealt: Number.parseInt(stats.data.damagebomb),
									kos: stats.data.kobomb,
								},
								mine: {
									damage_dealt: Number.parseInt(stats.data.damagemine),
									kos: stats.data.komine,
								},
								spikeball: {
									damage_dealt: Number.parseInt(stats.data.damagespikeball),
									kos: stats.data.kospikeball,
								},
								sidekick: {
									damage_dealt: Number.parseInt(stats.data.damagesidekick),
									kos: stats.data.kosidekick,
								},
								snowball: {
									hits: stats.data.hitsnowball,
									kos: stats.data.kosnowball,
								},
							},
							weapons: weapons.toSorted(
								(weaponA, weaponB) => weaponB.stats.xp - weaponA.stats.xp,
							),
							legends: legends.toSorted(
								(legendA, legendB) => legendB.stats.xp - legendA.stats.xp,
							),
							bookmark: bookmark ?? null,
						},
						meta: {
							playerId,
							updatedAt,
							timestamp: new Date().toISOString(),
						},
					},
					HttpStatus.OK,
				)
			} catch (error) {
				console.error("Error fetching player data:", error)
				return c.json(
					{
						error: {
							code: "PLAYER_NOT_FOUND" as const,
							message: "Player not found",
							details: ["The requested player could not be found"],
						},
					},
					HttpStatus.NOT_FOUND,
				)
			}
		},
	)

	// GET /brawlhalla/players/:playerId/aliases - Get player aliases with pagination
	.openapi(
		createRoute({
			method: "get",
			path: "/players/{playerId}/aliases",
			description: "Get player aliases with pagination",
			summary: "Get player aliases with pagination",
			tags: ["Brawlhalla"],
			request: {
				params: z.object({
					playerId: z.string(),
				}),
			},
			responses: {
				[HttpStatus.OK]: jsonContent(
					z.object({
						data: z.array(z.any()),
						pagination: z.object({
							page: z.number(),
							limit: z.number(),
							hasMore: z.boolean(),
						}),
						meta: z.object({
							playerId: z.string(),
							count: z.number(),
							timestamp: z.string(),
						}),
					}),
					"Player aliases retrieved successfully",
				),
				[HttpStatus.BAD_REQUEST]: jsonErrorContent(
					["INVALID_PAGINATION"] as const,
					"Invalid pagination parameters",
				),
				[HttpStatus.INTERNAL_SERVER_ERROR]: jsonErrorContent(
					["FETCH_ALIASES_FAILED"] as const,
					"Failed to fetch player aliases",
				),
			},
			middleware: optionalAuthMiddleware,
		}),
		async (c) => {
			try {
				const { playerId } = c.req.param()
				const { page, limit } = c.req.query()

				const pageNumber = page ? Number.parseInt(page) : 1
				const limitNumber = limit ? Number.parseInt(limit) : 10

				if (pageNumber < 1 || limitNumber < 1 || limitNumber > 100) {
					return c.json(
						{
							error: {
								code: "INVALID_PAGINATION" as const,
								message: "Invalid pagination parameters",
								details: ["Page must be >= 1, limit must be between 1 and 100"],
							},
						},
						HttpStatus.BAD_REQUEST,
					)
				}

				const aliases = await archiveService.getAliases(playerId, pageNumber)

				return c.json(
					{
						data: aliases,
						pagination: {
							page: pageNumber,
							limit: limitNumber,
							hasMore: aliases.length === limitNumber,
						},
						meta: {
							playerId,
							count: aliases.length,
							timestamp: new Date().toISOString(),
						},
					},
					HttpStatus.OK,
				)
			} catch (error) {
				console.error("Error fetching player aliases:", error)
				return c.json(
					{
						error: {
							code: "FETCH_ALIASES_FAILED" as const,
							message: "Failed to fetch player aliases",
							details: ["An error occurred while retrieving player aliases"],
						},
					},
					HttpStatus.INTERNAL_SERVER_ERROR,
				)
			}
		},
	)

	// GET /brawlhalla/clans/search - Search for clans with pagination and filtering
	.openapi(
		createRoute({
			method: "get",
			path: "/clans/search",
			description: "Search for clans with pagination and filtering",
			summary: "Search for clans with pagination and filtering",
			tags: ["Brawlhalla"],
			request: {
				query: z.object({
					page: z.coerce.number().min(1).default(1),
					limit: z.coerce.number().min(1).max(100).default(50),
					name: z.string().optional(),
				}),
			},
			responses: {
				[HttpStatus.OK]: jsonContent(
					z.object({
						data: z.array(z.any()),
						pagination: z.object({
							page: z.number(),
							limit: z.number(),
							hasMore: z.boolean(),
							total: z.number().nullable(),
						}),
						meta: z.object({
							query: z.object({
								name: z.string().optional(),
							}),
							count: z.number(),
							timestamp: z.string(),
						}),
					}),
					"Clans retrieved successfully",
				),
				[HttpStatus.BAD_REQUEST]: jsonErrorContent(
					["INVALID_PAGINATION"] as const,
					"Invalid pagination parameters",
				),
				[HttpStatus.INTERNAL_SERVER_ERROR]: jsonErrorContent(
					["SEARCH_CLANS_FAILED"] as const,
					"Failed to search clans",
				),
			},
			middleware: optionalAuthMiddleware,
		}),
		async (c) => {
			try {
				const { page, limit, name } = c.req.valid("query")

				if (page < 1 || limit < 1 || limit > 100) {
					return c.json(
						{
							error: {
								code: "INVALID_PAGINATION" as const,
								message: "Invalid pagination parameters",
								details: ["Page must be >= 1, limit must be between 1 and 100"],
							},
						},
						HttpStatus.BAD_REQUEST,
					)
				}

				const clansResult = await archiveService.getClans({
					page,
					name,
				})

				return c.json(
					{
						data: clansResult.clans,
						pagination: {
							page,
							limit,
							hasMore: clansResult.clans.length === limit,
							total: clansResult.total,
						},
						meta: {
							query: { name },
							count: clansResult.clans.length,
							timestamp: new Date().toISOString(),
						},
					},
					HttpStatus.OK,
				)
			} catch (error) {
				console.error("Error searching clans:", error)
				return c.json(
					{
						error: {
							code: "SEARCH_CLANS_FAILED" as const,
							message: "Failed to search clans",
							details: ["An error occurred while searching for clans"],
						},
					},
					HttpStatus.INTERNAL_SERVER_ERROR,
				)
			}
		},
	)

	// GET /brawlhalla/clans/:clanId - Get clan details
	.openapi(
		createRoute({
			method: "get",
			path: "/clans/{clanId}",
			description: "Get clan details by clan ID",
			summary: "Get clan details by clan ID",
			tags: ["Brawlhalla"],
			responses: {
				[HttpStatus.OK]: jsonContent(
					z.object({
						data: z.any(),
						meta: z.object({
							clanId: z.string(),
							timestamp: z.string(),
						}),
					}),
					"Clan details retrieved successfully",
				),
				[HttpStatus.NOT_FOUND]: jsonErrorContent(
					["CLAN_NOT_FOUND"] as const,
					"Clan not found",
				),
			},
			middleware: optionalAuthMiddleware,
		}),
		async (c) => {
			try {
				const { clanId } = c.req.param()
				const clan = await brawlhallaService.getClanById(clanId)

				return c.json(
					{
						data: clan,
						meta: {
							clanId,
							timestamp: new Date().toISOString(),
						},
					},
					HttpStatus.OK,
				)
			} catch (error) {
				console.error("Error fetching clan:", error)
				return c.json(
					{
						error: {
							code: "CLAN_NOT_FOUND" as const,
							message: "Clan not found",
							details: ["The requested clan could not be found"],
						},
					},
					HttpStatus.NOT_FOUND,
				)
			}
		},
	)

	// GET /brawlhalla/rankings/1v1 - Get 1v1 rankings with pagination and filtering
	.openapi(
		createRoute({
			method: "get",
			path: "/rankings/1v1",
			description: "Get 1v1 rankings with pagination and filtering",
			summary: "Get 1v1 rankings with pagination and filtering",
			tags: ["Brawlhalla"],
			responses: {
				[HttpStatus.OK]: jsonContent(
					z.object({
						data: z.array(z.any()),
						pagination: z.object({
							page: z.number(),
							limit: z.number(),
							hasMore: z.boolean(),
						}),
						meta: z.object({
							region: z.string(),
							query: z.object({
								name: z.string().optional(),
							}),
							count: z.number(),
							updatedAt: z.date(),
							timestamp: z.string(),
						}),
					}),
					"1v1 rankings retrieved successfully",
				),
				[HttpStatus.BAD_REQUEST]: jsonErrorContent(
					["INVALID_PAGINATION"] as const,
					"Invalid pagination parameters",
				),
				[HttpStatus.INTERNAL_SERVER_ERROR]: jsonErrorContent(
					["FETCH_RANKINGS_FAILED"] as const,
					"Failed to fetch 1v1 rankings",
				),
			},
			middleware: optionalAuthMiddleware,
		}),
		async (c) => {
			try {
				const { region, page, limit, name } = c.req.query()

				const pageNumber = page ? Number.parseInt(page) : 1
				const limitNumber = limit ? Number.parseInt(limit) : 50
				const regionParam = region || "all"

				if (pageNumber < 1 || limitNumber < 1 || limitNumber > 100) {
					return c.json(
						{
							error: {
								code: "INVALID_PAGINATION" as const,
								message: "Invalid pagination parameters",
								details: ["Page must be >= 1, limit must be between 1 and 100"],
							},
						},
						HttpStatus.BAD_REQUEST,
					)
				}

				const rankingsResult = await brawlhallaService.getRankings1v1(
					regionParam,
					pageNumber,
					name,
				)

				return c.json(
					{
						data: rankingsResult.data,
						pagination: {
							page: pageNumber,
							limit: limitNumber,
							hasMore: rankingsResult.data.length === limitNumber,
						},
						meta: {
							region: regionParam,
							query: { name },
							count: rankingsResult.data.length,
							updatedAt: rankingsResult.updatedAt,
							timestamp: new Date().toISOString(),
						},
					},
					HttpStatus.OK,
				)
			} catch (error) {
				console.error("Error fetching 1v1 rankings:", error)
				return c.json(
					{
						error: {
							code: "FETCH_RANKINGS_FAILED" as const,
							message: "Failed to fetch 1v1 rankings",
							details: ["An error occurred while retrieving rankings"],
						},
					},
					HttpStatus.INTERNAL_SERVER_ERROR,
				)
			}
		},
	)

	// GET /brawlhalla/rankings/2v2 - Get 2v2 rankings with pagination
	.openapi(
		createRoute({
			method: "get",
			path: "/rankings/2v2",
			description: "Get 2v2 rankings with pagination",
			summary: "Get 2v2 rankings with pagination",
			tags: ["Brawlhalla"],
			responses: {
				[HttpStatus.OK]: jsonContent(
					z.object({
						data: z.array(z.any()),
						pagination: z.object({
							page: z.number(),
							limit: z.number(),
							hasMore: z.boolean(),
						}),
						meta: z.object({
							region: z.string(),
							count: z.number(),
							updatedAt: z.date(),
							timestamp: z.string(),
						}),
					}),
					"2v2 rankings retrieved successfully",
				),
				[HttpStatus.BAD_REQUEST]: jsonErrorContent(
					["INVALID_PAGINATION"] as const,
					"Invalid pagination parameters",
				),
				[HttpStatus.INTERNAL_SERVER_ERROR]: jsonErrorContent(
					["FETCH_RANKINGS_FAILED"] as const,
					"Failed to fetch 2v2 rankings",
				),
			},
			middleware: optionalAuthMiddleware,
		}),
		async (c) => {
			try {
				const { region, page, limit } = c.req.query()

				const pageNumber = page ? Number.parseInt(page) : 1
				const limitNumber = limit ? Number.parseInt(limit) : 50
				const regionParam = region || "all"

				if (pageNumber < 1 || limitNumber < 1 || limitNumber > 100) {
					return c.json(
						{
							error: {
								code: "INVALID_PAGINATION" as const,
								message: "Invalid pagination parameters",
								details: ["Page must be >= 1, limit must be between 1 and 100"],
							},
						},
						HttpStatus.BAD_REQUEST,
					)
				}

				const rankingsResult = await brawlhallaService.getRankings2v2(
					regionParam,
					pageNumber,
				)

				return c.json(
					{
						data: rankingsResult.data,
						pagination: {
							page: pageNumber,
							limit: limitNumber,
							hasMore: rankingsResult.data.length === limitNumber,
						},
						meta: {
							region: regionParam,
							count: rankingsResult.data.length,
							updatedAt: rankingsResult.updatedAt,
							timestamp: new Date().toISOString(),
						},
					},
					HttpStatus.OK,
				)
			} catch (error) {
				console.error("Error fetching 2v2 rankings:", error)
				return c.json(
					{
						error: {
							code: "FETCH_RANKINGS_FAILED" as const,
							message: "Failed to fetch 2v2 rankings",
							details: ["An error occurred while retrieving rankings"],
						},
					},
					HttpStatus.INTERNAL_SERVER_ERROR,
				)
			}
		},
	)

	// GET /brawlhalla/rankings/power - Get power rankings with filtering and sorting
	.openapi(
		createRoute({
			method: "get",
			path: "/rankings/power",
			description: "Get power rankings with filtering and sorting",
			summary: "Get power rankings with filtering and sorting",
			tags: ["Brawlhalla"],
			request: {
				query: z.object({
					region: z.string().optional(),
					page: z.coerce.number().min(1).default(1),
					limit: z.coerce.number().min(1).max(100).default(50),
					orderBy: z.string().optional(),
					order: z.string().optional(),
					gameMode: z.string().optional(),
				}),
			},
			responses: {
				[HttpStatus.OK]: jsonContent(
					z.object({
						data: z.array(z.any()),
						pagination: z.object({
							page: z.coerce.number().min(1).default(1),
							limit: z.coerce.number().min(1).max(100).default(50),
							hasMore: z.boolean(),
							totalPages: z.number(),
						}),
						meta: z.object({
							region: z.string().optional(),
							filters: z.object({
								orderBy: z.string().optional(),
								order: z.string().optional(),
								gameMode: z.string().optional(),
							}),
							count: z.number(),
							lastUpdated: z.string(),
							timestamp: z.string(),
						}),
					}),
					"Power rankings retrieved successfully",
				),
				[HttpStatus.BAD_REQUEST]: jsonErrorContent(
					["INVALID_PAGINATION"] as const,
					"Invalid pagination parameters",
				),
				[HttpStatus.INTERNAL_SERVER_ERROR]: jsonErrorContent(
					["FETCH_POWER_RANKINGS_FAILED"] as const,
					"Failed to fetch power rankings",
				),
			},
			middleware: optionalAuthMiddleware,
		}),
		async (c) => {
			try {
				const { region, page, limit, orderBy, order, gameMode } =
					c.req.valid("query")

				if (page < 1 || limit < 1 || limit > 100) {
					return c.json(
						{
							error: {
								code: "INVALID_PAGINATION" as const,
								message: "Invalid pagination parameters",
								details: ["Page must be >= 1, limit must be between 1 and 100"],
							},
						},
						HttpStatus.BAD_REQUEST,
					)
				}

				const rankingsResult = await brawltoolsService.getPowerRankings({
					region,
					page,
					orderBy: orderBy as PowerRankingsOrderBy,
					order: order as PowerRankingsOrder,
					gameMode: gameMode as PowerRankingsGameMode,
				})

				return c.json(
					{
						data: rankingsResult.rankings.prPlayers,
						pagination: {
							page,
							limit,
							hasMore: rankingsResult.rankings.prPlayers.length === limit,
							totalPages: rankingsResult.rankings.totalPages,
						},
						meta: {
							region,
							filters: { orderBy, order, gameMode },
							count: rankingsResult.rankings.prPlayers.length,
							lastUpdated: rankingsResult.rankings.lastUpdated,
							timestamp: new Date().toISOString(),
						},
					},
					HttpStatus.OK,
				)
			} catch (error) {
				console.error("Error fetching power rankings:", error)
				return c.json(
					{
						error: {
							code: "FETCH_POWER_RANKINGS_FAILED" as const,
							message: "Failed to fetch power rankings",
							details: ["An error occurred while retrieving power rankings"],
						},
					},
					HttpStatus.INTERNAL_SERVER_ERROR,
				)
			}
		},
	)

	// GET /brawlhalla/location - Get user's region based on IP
	.openapi(
		createRoute({
			method: "get",
			path: "/location",
			description: "Get user's region based on IP address",
			summary: "Get user's region based on IP address",
			tags: ["Brawlhalla"],
			responses: {
				[HttpStatus.OK]: jsonContent(
					z.object({
						data: z.object({
							region: z.string().nullable(),
						}),
						meta: z.object({
							ip: z.string(),
							timestamp: z.string(),
						}),
					}),
					"Location determined successfully",
				),
				[HttpStatus.BAD_REQUEST]: jsonErrorContent(
					["IP_NOT_FOUND"] as const,
					"Could not determine IP address",
				),
				[HttpStatus.INTERNAL_SERVER_ERROR]: jsonErrorContent(
					["LOCATION_DETECTION_FAILED"] as const,
					"Failed to determine location",
				),
			},
			middleware: optionalAuthMiddleware,
		}),
		async (c) => {
			try {
				const ip = getIp(c)

				if (!ip) {
					return c.json(
						{
							error: {
								code: "IP_NOT_FOUND" as const,
								message: "Could not determine IP address",
								details: [
									"Unable to determine your IP address for region detection",
								],
							},
						},
						HttpStatus.BAD_REQUEST,
					)
				}

				const region = await getRegion(ip)

				return c.json(
					{
						data: { region },
						meta: {
							ip,
							timestamp: new Date().toISOString(),
						},
					},
					HttpStatus.OK,
				)
			} catch (error) {
				console.error("Error determining location:", error)
				return c.json(
					{
						error: {
							code: "LOCATION_DETECTION_FAILED" as const,
							message: "Failed to determine location",
							details: ["An error occurred while determining your location"],
						},
					},
					HttpStatus.INTERNAL_SERVER_ERROR,
				)
			}
		},
	)

	// GET /brawlhalla/weekly-rotation - Get weekly legend rotation
	.openapi(
		createRoute({
			method: "get",
			path: "/weekly-rotation",
			description: "Get weekly legend rotation",
			summary: "Get weekly legend rotation",
			tags: ["Brawlhalla"],
			responses: {
				[HttpStatus.OK]: jsonContent(
					z.object({
						data: z.any(),
						meta: z.object({
							timestamp: z.string(),
							updatedAt: z.date(),
						}),
					}),
					"Weekly rotation retrieved successfully",
				),
				[HttpStatus.INTERNAL_SERVER_ERROR]: jsonErrorContent(
					["FETCH_ROTATION_FAILED"] as const,
					"Failed to fetch weekly rotation",
				),
			},
			middleware: optionalAuthMiddleware,
		}),
		async (c) => {
			try {
				const weeklyRotation = await brawlhallaGqlService.getWeeklyRotation()

				return c.json(
					{
						data: weeklyRotation.data,
						meta: {
							timestamp: new Date().toISOString(),
							updatedAt: weeklyRotation.updatedAt,
						},
					},
					HttpStatus.OK,
				)
			} catch (error) {
				console.error("Error fetching weekly rotation:", error)
				return c.json(
					{
						error: {
							code: "FETCH_ROTATION_FAILED" as const,
							message: "Failed to fetch weekly rotation",
							details: [
								"An error occurred while retrieving the weekly rotation",
							],
						},
					},
					HttpStatus.INTERNAL_SERVER_ERROR,
				)
			}
		},
	)

	// GET /brawlhalla/articles - Get articles with pagination and filtering
	.openapi(
		createRoute({
			method: "get",
			path: "/articles",
			description: "Get articles with pagination and filtering",
			summary: "Get articles with pagination and filtering",
			tags: ["Brawlhalla"],
			request: {
				query: z.object({
					category: z.string().optional(),
					first: z.coerce.number().min(1).optional().default(10),
					after: z.string().optional(),
					withContent: z.boolean().optional(),
				}),
			},
			responses: {
				[HttpStatus.OK]: jsonContent(
					z.object({
						data: z.array(z.any()),
						pagination: z.object({
							first: z.number(),
							after: z.string().optional(),
							hasMore: z.boolean(),
						}),
						meta: z.object({
							category: z.string().optional(),
							withContent: z.boolean(),
							count: z.number(),
							updatedAt: z.date(),
							timestamp: z.string(),
						}),
					}),
					"Articles retrieved successfully",
				),
				[HttpStatus.BAD_REQUEST]: jsonErrorContent(
					["INVALID_LIMIT"] as const,
					"Invalid limit parameter",
				),
				[HttpStatus.INTERNAL_SERVER_ERROR]: jsonErrorContent(
					["FETCH_ARTICLES_FAILED"] as const,
					"Failed to fetch articles",
				),
			},
			middleware: optionalAuthMiddleware,
		}),
		async (c) => {
			try {
				const { category, first, after, withContent } = c.req.valid("query")

				if (first < 1 || first > 100) {
					return c.json(
						{
							error: {
								code: "INVALID_LIMIT" as const,
								message: "Invalid limit parameter",
								details: ["First parameter must be between 1 and 100"],
							},
						},
						HttpStatus.BAD_REQUEST,
					)
				}

				const articlesResult = await brawlhallaGqlService.getArticles({
					category,
					first,
					after,
					withContent: !!withContent,
				})

				return c.json(
					{
						data: articlesResult.data,
						pagination: {
							first,
							after,
							hasMore: articlesResult.data.length === first,
						},
						meta: {
							category,
							withContent: !!withContent,
							count: articlesResult.data.length,
							updatedAt: articlesResult.updatedAt,
							timestamp: new Date().toISOString(),
						},
					},
					HttpStatus.OK,
				)
			} catch (error) {
				console.error("Error fetching articles:", error)
				return c.json(
					{
						error: {
							code: "FETCH_ARTICLES_FAILED" as const,
							message: "Failed to fetch articles",
							details: ["An error occurred while retrieving articles"],
						},
					},
					HttpStatus.INTERNAL_SERVER_ERROR,
				)
			}
		},
	)
