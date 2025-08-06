import { OpenAPIHono as Hono, createRoute, z } from "@hono/zod-openapi"
import { cors } from "hono/cors"
import { register } from "prom-client"
import { env } from "./env"
import HttpStatus from "./helpers/http-status"
import { jsonContent } from "./helpers/json-content"
import { logger } from "./helpers/logger"
import { collectMetrics } from "./metrics"
import { v1Route } from "./routes/v1"

const app = new Hono()
app
	.use(
		"*",
		cors({
			origin: env.CLIENT_URL,
			allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		}),
	)
	.use("*", async (c, next) => {
		const start = Date.now()
		await next()
		const duration = Date.now() - start
		const status = c.res.status
		const method = c.req.method
		const path = c.req.path

		collectMetrics(method, path, status, duration)

		logger.info(
			{
				method,
				path,
				status,
				duration,
			},
			`${method} ${path} ${status} ${duration}ms`,
		)
	})

const publicRoutes = app
	.openapi(
		createRoute({
			method: "get",
			path: "/health",
			description: "Health check",
			summary: "Health check",
			responses: {
				[HttpStatus.OK]: jsonContent(z.object({ message: z.string() }), "OK"),
			},
		}),
		(c) => c.json({ message: "OK" }, HttpStatus.OK),
	)
	.route("/v1", v1Route)

app.doc("/openapi", {
	openapi: "3.0.0",
	info: {
		version: "1.0.0",
		title: "dair.gg API",
	},
	servers: [{ url: env.API_URL, description: "dair.gg" }],
	tags: [
		{
			name: "Auth",
			description: "Authentication endpoints",
		},
		{
			name: "Brawlhalla",
			description: "Brawlhalla endpoints",
		},
		{
			name: "Bookmarks",
			description: "Bookmarks endpoints",
		},
	],
})

const SCALAR_URL = "https://cdn.jsdelivr.net/npm/@scalar/api-reference"

app.get("/", (c) => {
	return c.html(`
			<!doctype html>
<html>
  <head>
    <title>dair.gg API Reference</title>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1" />
  </head>
  <body>
    <div id="app"></div>
    <script src="${SCALAR_URL}"></script>
    <script>
      Scalar.createApiReference('#app', {
        url: '/openapi',
      })
    </script>
  </body>
</html>`)
})

app.get("/metrics", async (c) => {
	c.header("Content-Type", register.contentType)
	return c.text(await register.metrics())
})

export default app

export type App = typeof publicRoutes
