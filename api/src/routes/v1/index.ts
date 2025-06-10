import { Hono } from "hono"
import { authRoute } from "./auth"
import { bookmarksRoute } from "./bookmarks"
import { brawlhallaRoute } from "./brawlhalla"

export const v1Route = new Hono()

v1Route.route("/auth", authRoute)
v1Route.route("/bookmarks", bookmarksRoute)
v1Route.route("/brawlhalla", brawlhallaRoute)
