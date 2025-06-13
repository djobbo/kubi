import { Hono } from "hono"
import { authMiddleware } from "../../middlewares/auth-middleware"
import { bookmarksService } from "../../services/bookmarks/bookmarks-service"

export const bookmarksRoute = new Hono()
	.get("/", authMiddleware, async (c) => {
		const session = c.get("session")
		const bookmarks = await bookmarksService.getBookmarks(session.user.id)
		return c.json({bookmarks})
	})
	.get("/:pageType/:pageId", authMiddleware, async (c) => {
		const session = c.get("session")
		const { pageId, pageType } = c.req.param()
		const [bookmark] = await bookmarksService.getBookmarksByPageIds(
			session?.user.id,
			[{ pageId, pageType }],
		)
		return c.json({
			bookmark
		})
	})
	.post("/:pageType/:pageId", authMiddleware, async (c) => {
		const session = c.get("session")
		const { pageId, pageType } = c.req.param()
		const { name, meta } = await c.req.json()
		const bookmark = await bookmarksService.addBookmark(session.user.id, {
			pageId,
			pageType,
			name,
			meta,
		})
		return c.json({bookmark})
	})
	.delete("/:pageType/:pageId", authMiddleware, async (c) => {
		const session = c.get("session")
		const { pageId, pageType } = c.req.param()
		await bookmarksService.deleteBookmark(session.user.id, { pageId, pageType })
		return c.json({ success: true })
	})
	.post("/migrate-legacy", authMiddleware, async (c) => {
		const session = c.get("session")
		await bookmarksService.migrateLegacyBookmarks(session)
		return c.json({ success: true })
	})
