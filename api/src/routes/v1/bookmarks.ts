import { Hono } from "hono"
import { authMiddleware } from "../../helpers/auth-middleware"
import { bookmarksService } from "../../services/bookmarks/bookmarks-service"

export const bookmarksRoute = new Hono()
	.get("/", authMiddleware, async (c) => {
		const session = c.get("session")
		const bookmarks = await bookmarksService.getBookmarks(session.user.id)
		return c.json(bookmarks)
	})
	.post("/", authMiddleware, async (c) => {
		const session = c.get("session")
		const { pageId, pageType, name } = await c.req.json()
		const bookmark = await bookmarksService.addBookmark(session.user.id, {
			pageId,
			pageType,
			name,
		})
		return c.json(bookmark)
	})
	.delete("/", authMiddleware, async (c) => {
		const session = c.get("session")
		const { pageId, pageType } = await c.req.json()
		await bookmarksService.deleteBookmark(session.user.id, { pageId, pageType })
		return c.json({ success: true })
	})
	.post("/migrate-legacy", authMiddleware, async (c) => {
		const session = c.get("session")
		await bookmarksService.migrateLegacyBookmarks(session)
		return c.json({ success: true })
	})
