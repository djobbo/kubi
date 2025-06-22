import type { PowerRankingsGameMode } from "@dair/brawlhalla-api/src/constants/power/game-mode"
import type {
	PowerRankingsOrder,
	PowerRankingsOrderBy,
} from "@dair/brawlhalla-api/src/constants/power/order-by"
import { Hono } from "hono"
import { resolver, validator } from "hono-openapi/zod"
import { z } from "zod/v4"
import {
	describeRoute,
	jsonErrorResponse,
	jsonResponse,
	queryParam,
} from "../../helpers/describe-route"
import { getIp } from "../../helpers/get-ip"
import { optionalAuthMiddleware } from "../../middlewares/auth-middleware"
import { archiveService } from "../../services/archive"
import { bookmarksService } from "../../services/bookmarks/bookmarks-service"
import { brawlhallaGqlService } from "../../services/brawlhalla-gql/brawlhalla-gql-service"
import { brawlhallaService } from "../../services/brawlhalla/brawlhalla-service"
import { brawltoolsService } from "../../services/brawltools/brawltools-service"
import { getRegion } from "../../services/locate"

export const brawlhallaRoute = new Hono()
	.use(optionalAuthMiddleware)

	// GET /brawlhalla/players/search - Search for players by name
	.get(
		"/players/search",
		describeRoute({
			description: "Search for players by name",
			summary: "Search for players by name",
			tags: ["Brawlhalla"],
			query: {
				name: {
					required: true,
					schema: z
						.string()
						.min(3, "Name parameter must be at least 3 characters long"),
				},
			},
			responses: {
				200: jsonResponse(
					"Successful response",
					z.object({
						data: z.array(z.any()),
						meta: z.object({
							query: z.string(),
							count: z.number(),
							timestamp: z.string(),
						}),
					}),
				),
				400: jsonErrorResponse(
					"Bad request - missing or invalid search parameter",
					["INVALID_SEARCH_PARAMETER"] as const,
				),
				500: jsonErrorResponse("Failed to search players", [
					"SEARCH_PLAYERS_FAILED",
				] as const),
			},
		}),
		async (c) => {
			try {
				const { name } = c.req.valid("query")
				const aliases = await archiveService.searchAliases(name)

				return c.json[200]({
					data: aliases,
					meta: {
						query: name,
						count: aliases.length,
						timestamp: new Date().toISOString(),
					},
				})
			} catch (error) {
				console.error("Error searching players:", error)
				return c.json[500]({
					error: {
						code: "SEARCH_PLAYERS_FAILED",
						message: "Failed to search players",
						details: ["An error occurred while searching for players"],
					},
				})
			}
		},
	)

	// GET /brawlhalla/players/:playerId - Get player stats and ranked data
	.get(
		"/players/:playerId",
		describeRoute({
			description: "Get player stats and ranked data by player ID",
			summary: "Get player stats and ranked data by player ID",
			tags: ["Brawlhalla"],
			responses: {
				200: jsonResponse(
					"Player data retrieved successfully",
					z.object({
						data: z.object({
							stats: z.any(),
							ranked: z.any(),
							aliases: z.array(z.any()),
							bookmark: z.any().nullable(),
						}),
						meta: z.object({
							playerId: z.string(),
							updatedAt: z.date(),
							timestamp: z.string(),
						}),
					}),
				),
				404: jsonErrorResponse("Player not found", [
					"PLAYER_NOT_FOUND",
				] as const),
			},
		}),
		async (c) => {
			try {
				const { playerId } = c.req.param()
				const playerStatsPromise =
					brawlhallaService.getPlayerStatsById(playerId)
				const playerRankedPromise =
					brawlhallaService.getPlayerRankedById(playerId)
				const [stats, ranked] = await Promise.all([
					playerStatsPromise,
					playerRankedPromise,
				])
				const session = c.get("session")
				const [aliases, [bookmark]] = await Promise.all([
					archiveService.getAliases(playerId),
					bookmarksService.getBookmarksByPageIds(session?.user.id, [
						{ pageId: playerId, pageType: "player_stats" },
					]),
				])
				const updatedAt =
					stats.updatedAt.getTime() > ranked.updatedAt.getTime()
						? stats.updatedAt
						: ranked.updatedAt

				return c.json[200]({
					data: {
						stats: stats.data,
						ranked: ranked.data,
						aliases,
						bookmark: bookmark ?? null,
					},
					meta: {
						playerId,
						updatedAt,
						timestamp: new Date().toISOString(),
					},
				})
			} catch (error) {
				console.error("Error fetching player data:", error)
				return c.json[404]({
					error: {
						code: "PLAYER_NOT_FOUND",
						message: "Player not found",
						details: ["The requested player could not be found"],
					},
				})
			}
		},
	)

	// GET /brawlhalla/players/:playerId/aliases - Get player aliases with pagination
	.get(
		"/players/:playerId/aliases",
		describeRoute({
			description: "Get player aliases with pagination",
			summary: "Get player aliases with pagination",
			tags: ["Brawlhalla"],
			responses: {
				200: jsonResponse(
					"Player aliases retrieved successfully",
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
				),
				400: jsonErrorResponse("Invalid pagination parameters", [
					"INVALID_PAGINATION",
				] as const),
				500: jsonErrorResponse("Failed to fetch player aliases", [
					"FETCH_ALIASES_FAILED",
				] as const),
			},
		}),
		async (c) => {
			try {
				const { playerId } = c.req.param()
				const { page, limit } = c.req.query()

				const pageNumber = page ? Number.parseInt(page) : 1
				const limitNumber = limit ? Number.parseInt(limit) : 10

				if (pageNumber < 1 || limitNumber < 1 || limitNumber > 100) {
					return c.json[400]({
						error: {
							code: "INVALID_PAGINATION",
							message: "Invalid pagination parameters",
							details: ["Page must be >= 1, limit must be between 1 and 100"],
						},
					})
				}

				const aliases = await archiveService.getAliases(playerId, pageNumber)

				return c.json[200]({
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
				})
			} catch (error) {
				console.error("Error fetching player aliases:", error)
				return c.json[500]({
					error: {
						code: "FETCH_ALIASES_FAILED",
						message: "Failed to fetch player aliases",
						details: ["An error occurred while retrieving player aliases"],
					},
				})
			}
		},
	)

	// GET /brawlhalla/clans/search - Search for clans with pagination and filtering
	.get(
		"/clans/search",
		describeRoute({
			description: "Search for clans with pagination and filtering",
			summary: "Search for clans with pagination and filtering",
			tags: ["Brawlhalla"],
			responses: {
				200: jsonResponse(
					"Clans retrieved successfully",
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
				),
				400: jsonErrorResponse("Invalid pagination parameters", [
					"INVALID_PAGINATION",
				] as const),
				500: jsonErrorResponse("Failed to search clans", [
					"SEARCH_CLANS_FAILED",
				] as const),
			},
		}),
		async (c) => {
			try {
				const { page, limit, name } = c.req.query()

				const pageNumber = page ? Number.parseInt(page) : 1
				const limitNumber = limit ? Number.parseInt(limit) : 50

				if (pageNumber < 1 || limitNumber < 1 || limitNumber > 100) {
					return c.json[400]({
						error: {
							code: "INVALID_PAGINATION",
							message: "Invalid pagination parameters",
							details: ["Page must be >= 1, limit must be between 1 and 100"],
						},
					})
				}

				const clansResult = await archiveService.getClans({
					page: pageNumber,
					name,
				})

				return c.json[200]({
					data: clansResult.clans,
					pagination: {
						page: pageNumber,
						limit: limitNumber,
						hasMore: clansResult.clans.length === limitNumber,
						total: clansResult.total,
					},
					meta: {
						query: { name },
						count: clansResult.clans.length,
						timestamp: new Date().toISOString(),
					},
				})
			} catch (error) {
				console.error("Error searching clans:", error)
				return c.json[500]({
					error: {
						code: "SEARCH_CLANS_FAILED",
						message: "Failed to search clans",
						details: ["An error occurred while searching for clans"],
					},
				})
			}
		},
	)

	// GET /brawlhalla/clans/:clanId - Get clan details
	.get(
		"/clans/:clanId",
		describeRoute({
			description: "Get clan details by clan ID",
			summary: "Get clan details by clan ID",
			tags: ["Brawlhalla"],
			responses: {
				200: jsonResponse(
					"Clan details retrieved successfully",
					z.object({
						data: z.any(),
						meta: z.object({
							clanId: z.string(),
							timestamp: z.string(),
						}),
					}),
				),
				404: jsonErrorResponse("Clan not found", ["CLAN_NOT_FOUND"] as const),
			},
		}),
		async (c) => {
			try {
				const { clanId } = c.req.param()
				const clan = await brawlhallaService.getClanById(clanId)

				return c.json[200]({
					data: clan,
					meta: {
						clanId,
						timestamp: new Date().toISOString(),
					},
				})
			} catch (error) {
				console.error("Error fetching clan:", error)
				return c.json[404]({
					error: {
						code: "CLAN_NOT_FOUND",
						message: "Clan not found",
						details: ["The requested clan could not be found"],
					},
				})
			}
		},
	)

	// GET /brawlhalla/rankings/1v1 - Get 1v1 rankings with pagination and filtering
	.get(
		"/rankings/1v1",
		describeRoute({
			description: "Get 1v1 rankings with pagination and filtering",
			summary: "Get 1v1 rankings with pagination and filtering",
			tags: ["Brawlhalla"],
			responses: {
				200: jsonResponse(
					"1v1 rankings retrieved successfully",
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
				),
				400: jsonErrorResponse("Invalid pagination parameters", [
					"INVALID_PAGINATION",
				] as const),
				500: jsonErrorResponse("Failed to fetch 1v1 rankings", [
					"FETCH_RANKINGS_FAILED",
				] as const),
			},
		}),
		async (c) => {
			try {
				const { region, page, limit, name } = c.req.query()

				const pageNumber = page ? Number.parseInt(page) : 1
				const limitNumber = limit ? Number.parseInt(limit) : 50
				const regionParam = region || "all"

				if (pageNumber < 1 || limitNumber < 1 || limitNumber > 100) {
					return c.json[400]({
						error: {
							code: "INVALID_PAGINATION",
							message: "Invalid pagination parameters",
							details: ["Page must be >= 1, limit must be between 1 and 100"],
						},
					})
				}

				const rankingsResult = await brawlhallaService.getRankings1v1(
					regionParam,
					pageNumber,
					name,
				)

				return c.json[200]({
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
				})
			} catch (error) {
				console.error("Error fetching 1v1 rankings:", error)
				return c.json[500]({
					error: {
						code: "FETCH_RANKINGS_FAILED",
						message: "Failed to fetch 1v1 rankings",
						details: ["An error occurred while retrieving rankings"],
					},
				})
			}
		},
	)

	// GET /brawlhalla/rankings/2v2 - Get 2v2 rankings with pagination
	.get(
		"/rankings/2v2",
		describeRoute({
			description: "Get 2v2 rankings with pagination",
			summary: "Get 2v2 rankings with pagination",
			tags: ["Brawlhalla"],
			responses: {
				200: jsonResponse(
					"2v2 rankings retrieved successfully",
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
				),
				400: jsonErrorResponse("Invalid pagination parameters", [
					"INVALID_PAGINATION",
				] as const),
				500: jsonErrorResponse("Failed to fetch 2v2 rankings", [
					"FETCH_RANKINGS_FAILED",
				] as const),
			},
		}),
		async (c) => {
			try {
				const { region, page, limit } = c.req.query()

				const pageNumber = page ? Number.parseInt(page) : 1
				const limitNumber = limit ? Number.parseInt(limit) : 50
				const regionParam = region || "all"

				if (pageNumber < 1 || limitNumber < 1 || limitNumber > 100) {
					return c.json[400]({
						error: {
							code: "INVALID_PAGINATION",
							message: "Invalid pagination parameters",
							details: ["Page must be >= 1, limit must be between 1 and 100"],
						},
					})
				}

				const rankingsResult = await brawlhallaService.getRankings2v2(
					regionParam,
					pageNumber,
				)

				return c.json[200]({
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
				})
			} catch (error) {
				console.error("Error fetching 2v2 rankings:", error)
				return c.json[500]({
					error: {
						code: "FETCH_RANKINGS_FAILED",
						message: "Failed to fetch 2v2 rankings",
						details: ["An error occurred while retrieving rankings"],
					},
				})
			}
		},
	)

	// GET /brawlhalla/rankings/power - Get power rankings with filtering and sorting
	.get(
		"/rankings/power",
		describeRoute({
			description: "Get power rankings with filtering and sorting",
			summary: "Get power rankings with filtering and sorting",
			tags: ["Brawlhalla"],
			responses: {
				200: jsonResponse(
					"Power rankings retrieved successfully",
					z.object({
						data: z.array(z.any()),
						pagination: z.object({
							page: z.number(),
							limit: z.number(),
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
				),
				400: jsonErrorResponse("Invalid pagination parameters", [
					"INVALID_PAGINATION",
				] as const),
				500: jsonErrorResponse("Failed to fetch power rankings", [
					"FETCH_POWER_RANKINGS_FAILED",
				] as const),
			},
		}),
		async (c) => {
			try {
				const { region, page, limit, orderBy, order, gameMode } = c.req.query()

				const pageNumber = page ? Number.parseInt(page) : 1
				const limitNumber = limit ? Number.parseInt(limit) : 50

				if (pageNumber < 1 || limitNumber < 1 || limitNumber > 100) {
					return c.json[400]({
						error: {
							code: "INVALID_PAGINATION",
							message: "Invalid pagination parameters",
							details: ["Page must be >= 1, limit must be between 1 and 100"],
						},
					})
				}

				const rankingsResult = await brawltoolsService.getPowerRankings({
					region,
					page: pageNumber,
					orderBy: orderBy as PowerRankingsOrderBy,
					order: order as PowerRankingsOrder,
					gameMode: gameMode as PowerRankingsGameMode,
				})

				return c.json[200]({
					data: rankingsResult.rankings.prPlayers,
					pagination: {
						page: pageNumber,
						limit: limitNumber,
						hasMore: rankingsResult.rankings.prPlayers.length === limitNumber,
						totalPages: rankingsResult.rankings.totalPages,
					},
					meta: {
						region,
						filters: { orderBy, order, gameMode },
						count: rankingsResult.rankings.prPlayers.length,
						lastUpdated: rankingsResult.rankings.lastUpdated,
						timestamp: new Date().toISOString(),
					},
				})
			} catch (error) {
				console.error("Error fetching power rankings:", error)
				return c.json[500]({
					error: {
						code: "FETCH_POWER_RANKINGS_FAILED",
						message: "Failed to fetch power rankings",
						details: ["An error occurred while retrieving power rankings"],
					},
				})
			}
		},
	)

	// GET /brawlhalla/location - Get user's region based on IP
	.get(
		"/location",
		describeRoute({
			description: "Get user's region based on IP address",
			summary: "Get user's region based on IP address",
			tags: ["Brawlhalla"],
			responses: {
				200: jsonResponse(
					"Location determined successfully",
					z.object({
						data: z.object({
							region: z.string().nullable(),
						}),
						meta: z.object({
							ip: z.string(),
							timestamp: z.string(),
						}),
					}),
				),
				400: jsonErrorResponse("Could not determine IP address", [
					"IP_NOT_FOUND",
				] as const),
				500: jsonErrorResponse("Failed to determine location", [
					"LOCATION_DETECTION_FAILED",
				] as const),
			},
		}),
		async (c) => {
			try {
				const ip = getIp(c)

				if (!ip) {
					return c.json[400]({
						error: {
							code: "IP_NOT_FOUND",
							message: "Could not determine IP address",
							details: [
								"Unable to determine your IP address for region detection",
							],
						},
					})
				}

				const region = await getRegion(ip)

				return c.json[200]({
					data: { region },
					meta: {
						ip,
						timestamp: new Date().toISOString(),
					},
				})
			} catch (error) {
				console.error("Error determining location:", error)
				return c.json[500]({
					error: {
						code: "LOCATION_DETECTION_FAILED",
						message: "Failed to determine location",
						details: ["An error occurred while determining your location"],
					},
				})
			}
		},
	)

	// GET /brawlhalla/weekly-rotation - Get weekly legend rotation
	.get(
		"/weekly-rotation",
		describeRoute({
			description: "Get weekly legend rotation",
			summary: "Get weekly legend rotation",
			tags: ["Brawlhalla"],
			responses: {
				200: jsonResponse(
					"Weekly rotation retrieved successfully",
					z.object({
						data: z.any(),
						meta: z.object({
							timestamp: z.string(),
							updatedAt: z.date(),
						}),
					}),
				),
				500: jsonErrorResponse("Failed to fetch weekly rotation", [
					"FETCH_ROTATION_FAILED",
				] as const),
			},
		}),
		async (c) => {
			try {
				const weeklyRotation = await brawlhallaGqlService.getWeeklyRotation()

				return c.json[200]({
					data: weeklyRotation.data,
					meta: {
						timestamp: new Date().toISOString(),
						updatedAt: weeklyRotation.updatedAt,
					},
				})
			} catch (error) {
				console.error("Error fetching weekly rotation:", error)
				return c.json[500]({
					error: {
						code: "FETCH_ROTATION_FAILED",
						message: "Failed to fetch weekly rotation",
						details: ["An error occurred while retrieving the weekly rotation"],
					},
				})
			}
		},
	)

	// GET /brawlhalla/articles - Get articles with pagination and filtering
	.get(
		"/articles",
		describeRoute({
			description: "Get articles with pagination and filtering",
			summary: "Get articles with pagination and filtering",
			tags: ["Brawlhalla"],
			query: {
				category: queryParam(z.string().optional()),
				first: queryParam(z.coerce.number().min(1).optional().default(10)),
				after: queryParam(z.string().optional()),
				withContent: queryParam(z.boolean().optional()),
			},
			responses: {
				200: jsonResponse(
					"Articles retrieved successfully",
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
				),
				400: jsonErrorResponse("Invalid limit parameter", [
					"INVALID_LIMIT",
				] as const),
				500: jsonErrorResponse("Failed to fetch articles", [
					"FETCH_ARTICLES_FAILED",
				] as const),
			},
		}),
		async (c) => {
			try {
				const { category, first, after, withContent } = c.req.valid("query")

				if (first < 1 || first > 100) {
					return c.json[400]({
						error: {
							code: "INVALID_LIMIT",
							message: "Invalid limit parameter",
							details: ["First parameter must be between 1 and 100"],
						},
					})
				}

				const articlesResult = await brawlhallaGqlService.getArticles({
					category,
					first,
					after,
					withContent: !!withContent,
				})

				return c.json[200]({
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
				})
			} catch (error) {
				console.error("Error fetching articles:", error)
				return c.json[500]({
					error: {
						code: "FETCH_ARTICLES_FAILED",
						message: "Failed to fetch articles",
						details: ["An error occurred while retrieving articles"],
					},
				})
			}
		},
	)
