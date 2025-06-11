import { Hono } from "hono"
import { authRoute } from "./auth"
import { bookmarksRoute } from "./bookmarks"
import { brawlhallaRoute } from "./brawlhalla"

export const v1Route = new Hono()
	.route("/auth", authRoute)
	.route("/bookmarks", bookmarksRoute)
	.route("/brawlhalla", brawlhallaRoute)
