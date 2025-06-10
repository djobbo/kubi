import { Hono } from "hono";
import {authRoute} from "./auth";
import {brawlhallaRoute} from "./brawlhalla";
import {bookmarksRoute} from "./bookmarks";

export const v1Route = new Hono();

v1Route.route("/auth", authRoute);
v1Route.route("/bookmarks", bookmarksRoute);
v1Route.route("/brawlhalla", brawlhallaRoute);
