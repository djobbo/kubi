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

				return c.json(
					{
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
