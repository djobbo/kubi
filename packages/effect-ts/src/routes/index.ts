import { serve } from "bun"
import { Config, Context, Effect, Layer } from "effect"
import { Hono } from "hono"
import { playersRoute } from "./brawlhalla/players"

export class HonoApi extends Context.Tag("HonoApi")<HonoApi, Bun.Server>() {}

interface HonoApiOptions {
	port: number
}

export const make = (options: HonoApiOptions) => {
	return Effect.gen(function* () {
		const app = new Hono()

		app.route("/brawlhalla/players", playersRoute)

		return yield* Effect.acquireRelease(
			Effect.sync(() =>
				serve({
					fetch: app.fetch,
					port: options.port,
				}),
			),
			(server) => Effect.sync(() => server.stop()),
		)
	})
}

export const layer = (options: HonoApiOptions) => {
	return Layer.scoped(HonoApi, make(options))
}

export const fromEnv = Layer.scoped(
	HonoApi,
	Effect.gen(function* () {
		const client = yield* make({
			port: yield* Config.number("API_PORT"),
		})
		return client
	}),
)
