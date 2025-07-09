import {
	getLegendsAccumulativeData,
	getWeaponlessData,
	getWeaponsData,
	parsePlayerLegends,
} from "@dair/brawlhalla-api/src/helpers/parser"
import { getSeasonStats } from "@dair/brawlhalla-api/src/helpers/season-reset"
import { OpenAPIHono as Hono, createRoute, z } from "@hono/zod-openapi"
import { Effect } from "effect"
import HttpStatus from "../../helpers/http-status"
import { jsonContent, jsonErrorContent } from "../../helpers/json-content"
import { Runtime } from "../../runtime"
import { BrawlhallaApi } from "../../services/brawlhalla-api"

export const playersRoute = Effect.gen(function* () {
	const app = new Hono()
		.openapi(
			createRoute({
				method: "get",
				path: "/{playerId}",
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
				const { playerId } = c.req.valid("param")
				const session = c.get("session")

				return Runtime.runPromise(
					Effect.gen(function* () {
						const brawlhallaApi = yield* BrawlhallaApi
						const [playerStats, playerRanked, allLegends] = yield* Effect.all([
							brawlhallaApi.playerStatsById(playerId).fetch(),
							brawlhallaApi.playerRankedById(playerId).fetch(),
							brawlhallaApi.allLegendsData().fetch(),
						])

						const clanId = playerStats.data.clan?.clan_id.toString()
						const [aliases, [bookmark], clan, maybeClanBookmark] =
							yield* Effect.all([
								archiveService.getAliases(playerId),
								bookmarksService.getBookmarksByPageIds(session?.user.id, [
									{ pageId: playerId, pageType: "player_stats" },
								]),
								clanId ? brawlhallaApi.clanById(clanId).fetch() : null,
								clanId
									? bookmarksService.getBookmarksByPageIds(session?.user.id, [
											{ pageId: clanId, pageType: "clan_stats" },
										])
									: null,
							])

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
						const { unarmed, gadgets, weapon_throws } =
							getWeaponlessData(legends)

						const name = playerStats.data.name
						const brawlhallaId = playerStats.data.brawlhalla_id

						const clanMember = clan?.data.clan.find(
							(member) => member.brawlhalla_id === brawlhallaId,
						)

						const seasonStats = getSeasonStats(playerRanked.data)
						const ranked2v2AccumulativeData = playerRanked.data["2v2"]?.reduce(
							(
								{ totalWins, totalGames, totalRating, totalPeakRating },
								team,
							) => ({
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
													(a, b) =>
														a.createdAt.getTime() - b.createdAt.getTime(),
												)
												.map((alias) => cleanString(alias.alias))
												.filter((alias) => alias !== name),
										),
									],
									stats: {
										xp: playerStats.data.xp,
										level: playerStats.data.level,
										xp_percentage: playerStats.data.xp_percentage,
										games: playerStats.data.games,
										wins: playerStats.data.wins,
										...accumulativeData,
									},
									ranked: playerRanked.data
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
													rating: playerRanked.data.rating,
													peak_rating: playerRanked.data.peak_rating,
													tier: playerRanked.data.tier ?? "Valhallan",
													wins: playerRanked.data.wins,
													games: playerRanked.data.games,
													region: playerRanked.data.region.toLowerCase(),
													rating_reset: getPersonalRatingReset(
														playerRanked.data.rating,
													),
												},
												"2v2": playerRanked.data["2v2"]
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
																		player1.id === brawlhallaId
																			? player2
																			: player1

																	return {
																		teammate,
																		rating: team.rating,
																		peak_rating: team.peak_rating,
																		tier: team.tier ?? "Valhallan",
																		wins: team.wins,
																		games: team.games,
																		region:
																			rankedRegions[team.region - 1] ?? "all",
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
													playerRanked.data.rotating_ranked &&
													!Array.isArray(playerRanked.data.rotating_ranked)
														? {
																rating:
																	playerRanked.data.rotating_ranked.rating,
																peak_rating:
																	playerRanked.data.rotating_ranked.peak_rating,
																tier: playerRanked.data.rotating_ranked.tier,
																wins: playerRanked.data.rotating_ranked.wins,
																games: playerRanked.data.rotating_ranked.games,
																region:
																	playerRanked.data.rotating_ranked.region.toLowerCase(),
															}
														: null,
											}
										: null,
									clan: playerStats.data.clan
										? {
												id: playerStats.data.clan.clan_id,
												name: playerStats.data.clan.clan_name,
												xp: Number.parseInt(playerStats.data.clan.clan_xp),
												personal_xp: playerStats.data.clan.personal_xp,
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
											damage_dealt: Number.parseInt(
												playerStats.data.damagebomb,
											),
											kos: playerStats.data.kobomb,
										},
										mine: {
											damage_dealt: Number.parseInt(
												playerStats.data.damagemine,
											),
											kos: playerStats.data.komine,
										},
										spikeball: {
											damage_dealt: Number.parseInt(
												playerStats.data.damagespikeball,
											),
											kos: playerStats.data.kospikeball,
										},
										sidekick: {
											damage_dealt: Number.parseInt(
												playerStats.data.damagesidekick,
											),
											kos: playerStats.data.kosidekick,
										},
										snowball: {
											hits: playerStats.data.hitsnowball,
											kos: playerStats.data.kosnowball,
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
					}),
				)
			},
		)
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
					const session = c.get("session")
					const [stats, ranked, allLegends] = await Promise.all([
						playerStatsPromise,
						playerRankedPromise,
						allLegendsPromise,
					])

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
												rating_reset: getPersonalRatingReset(
													ranked.data.rating,
												),
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
																	player1.id === brawlhallaId
																		? player2
																		: player1

																return {
																	teammate,
																	rating: team.rating,
																	peak_rating: team.peak_rating,
																	tier: team.tier ?? "Valhallan",
																	wins: team.wins,
																	games: team.games,
																	region:
																		rankedRegions[team.region - 1] ?? "all",
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

	return app
})
