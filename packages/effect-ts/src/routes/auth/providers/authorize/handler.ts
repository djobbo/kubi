import type { Provider } from "@dair/schema"
import { HttpServerResponse } from "@effect/platform"
import { Effect } from "effect"
import { Authorization } from "../../../../services/authorization"
import type { State } from "../callback/handler"

export const authorize = (provider: Provider, state: typeof State.Type) =>
	Effect.gen(function* () {
		const authorizationService = yield* Authorization

		const authorizationUrl = authorizationService
			.createAuthorizationURL(provider, state)
			.toString()

		return HttpServerResponse.redirect(authorizationUrl)
	})
