import { Hono } from "hono"
import { describeRoute } from "hono-openapi"
import { resolver, validator } from "hono-openapi/zod"
import { z } from "zod"
import { getIp } from "../../helpers/get-ip"
import { archiveService } from "../../services/archive"
import { brawlhallaGqlService } from "../../services/brawlhalla-gql/brawlhalla-gql-service"
import { brawlhallaService } from "../../services/brawlhalla/brawlhalla-service"
import { brawltoolsService } from "../../services/brawltools/brawltools-service"
import { getRegion } from "../../services/locate"
import { optionalAuthMiddleware } from '../../middlewares/auth-middleware'
import { bookmarksService } from '../../services/bookmarks/bookmarks-service'

export const brawlhallaRoute = new Hono()
	.use(optionalAuthMiddleware)
	.get(
		"/players/search",
		describeRoute({
			description: "Search for a player",
			responses: {
				200: {
					description: "Successful response",
					content: {
						"application/json": { schema: resolver(z.any()) },
					},
				},
			},
		}),
		validator(
			"query",
			z.object({
				name: z.string(),
			}),
		),
		async (c) => {
			const { name } = c.req.valid("query")
			const aliases = await archiveService.searchAliases(name)
			return c.json(aliases)
		},
	)
	.get("/players/:playerId", async (c) => {
		const { playerId } = c.req.param()
		const playerStatsPromise = brawlhallaService.getPlayerStatsById(playerId)
		const playerRankedPromise = brawlhallaService.getPlayerRankedById(playerId)
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
		const updatedAt = stats.updatedAt.getTime() > ranked.updatedAt.getTime() ? stats.updatedAt : ranked.updatedAt

		return c.json({
			stats: stats.data,
			ranked: ranked.data,
			updatedAt,
			aliases,
			bookmark: bookmark ?? null,
		})
	})
	.get("/players/:playerId/aliases/:page?", async (c) => {
		const { playerId, page } = c.req.param()
		const aliases = await archiveService.getAliases(
			playerId,
			page ? Number.parseInt(page) : undefined,
		)
		return c.json(aliases)
	})
	.get("/clans/search/:page?", async (c) => {
		const { page } = c.req.param()
		const { name } = c.req.query()
		const clans = await archiveService.getClans({
			page: page ? Number.parseInt(page) : undefined,
			name,
		})
		return c.json(clans)
	})
	.get("/clans/:clanId", async (c) => {
		const { clanId } = c.req.param()
		const clan = await brawlhallaService.getClanById(clanId)
		return c.json(clan)
	})
	.get("/rankings/1v1/:region?/:page?", async (c) => {
		const { region, page } = c.req.param()
		const { name } = c.req.query()
		const rankings = await brawlhallaService.getRankings1v1(
			region,
			page ? Number.parseInt(page) : undefined,
			name,
		)
		return c.json(rankings)
	})
	.get("/rankings/2v2/:region?/:page?", async (c) => {
		const { region, page } = c.req.param()
		const rankings = await brawlhallaService.getRankings2v2(
			region,
			page ? Number.parseInt(page) : undefined,
		)
		return c.json(rankings)
	})
	.get("/rankings/power/:region?/:page?", async (c) => {
		const { region, page } = c.req.param()
		const { orderBy, order, gameMode } = c.req.query()

		const rankings = await brawltoolsService.getPowerRankings({
			region,
			page,
			orderBy,
			order,
			gameMode,
		})
		return c.json(rankings)
	})
	.get("/locate", async (c) => {
		const ip = getIp(c)

		if (!ip) {
			return c.json({ error: "Could not determine region" }, 400)
		}

		const region = await getRegion(ip)
		return c.json({ region })
	})
	.get("/weekly-rotation", async (c) => {
		const weeklyRotation = await brawlhallaGqlService.getWeeklyRotation()
		return c.json(weeklyRotation)
	})
	.get("/articles/:category?", async (c) => {
		const { category } = c.req.param()
		const { first, after, withContent } = c.req.query()
		const articles = await brawlhallaGqlService.getArticles({
			category,
			first: first ? Number.parseInt(first) : undefined,
			after,
			withContent: !!withContent,
		})
		return c.json(articles)
	})
