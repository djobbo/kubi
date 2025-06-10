import { Hono } from "hono";
import { bookmarksService } from '../../services/bookmarks/bookmarks-service';
import { authMiddleware } from '../../helpers/auth-middleware';

export const bookmarksRoute = new Hono();

bookmarksRoute.get("/", authMiddleware, async (c) => {
  const session = c.get('session');
  const bookmarks = await bookmarksService.getBookmarks(session.user.id);
  return c.json(bookmarks);
});

bookmarksRoute.post("/", authMiddleware, async (c) => {
  const session = c.get('session');
  const { pageId, pageType, name } = await c.req.json();
  const bookmark = await bookmarksService.addBookmark(session.user.id, { pageId, pageType, name });
  return c.json(bookmark);
});

bookmarksRoute.delete("/", authMiddleware, async (c) => {
  const session = c.get('session');
  const { pageId, pageType } = await c.req.json();
  await bookmarksService.deleteBookmark(session.user.id, { pageId, pageType });
  return c.json({ success: true });
});

bookmarksRoute.post("/migrate-legacy", authMiddleware, async (c) => {
  const session = c.get('session');
  await bookmarksService.migrateLegacyBookmarks(session);
  return c.json({ success: true });
});
