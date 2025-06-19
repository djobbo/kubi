import { swaggerUI } from "@hono/swagger-ui"
import { Hono } from "hono"
import { openAPISpecs } from "hono-openapi"
import { cors } from "hono/cors"
import { register } from "prom-client"
import { env } from "./env"
import { logger } from "./helpers/logger"
import { collectMetrics } from "./metrics"
import { v1Route } from "./routes/v1"

const app = new Hono()
	.use(
		"*",
		cors({
			origin: env.CLIENT_URL,
			allowMethods: ["GET", "POST", "DELETE", "OPTIONS"],
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
	.get("/health", (c) => c.json({ message: "OK" }))
	.get("/", (c) => {
		logger.info("Root endpoint accessed")
		return c.text("Welcome to the dair.gg api!")
	})
	.route("/v1", v1Route)

app.get(
	"/openapi",
	openAPISpecs(app, {
		documentation: {
			info: {
				title: "dair.gg API",
				version: "1.0.0",
				description: "dair.gg API",
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
		},
	}),
)

app.get(
	"/ui",
	swaggerUI({
		url: "/openapi",
		title: "dair.gg API",
	}),
)

app.get("/metrics", async (c) => {
	c.header("Content-Type", register.contentType)
	return c.text(await register.metrics())
})

export default app

export type App = typeof app
