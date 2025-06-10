import { swaggerUI } from "@hono/swagger-ui"
import { Hono } from "hono"
import { openAPISpecs } from "hono-openapi"
import { env } from "./env"
import { v1Route } from "./routes/v1"

const app = new Hono()

app.get("/", (c) => {
	return c.text("Welcome to the dair.gg api!")
})

app.route("/v1", v1Route)

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

export default app
