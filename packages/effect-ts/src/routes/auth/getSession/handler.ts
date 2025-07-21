import { Effect } from "effect"
import { Authorization } from "../../../services/authorization"

export const getSession = () =>
	Effect.gen(function* () {
		const authorizationService = yield* Authorization
		const session = yield* authorizationService.getSession()

		return {
			data: session,
			meta: {
				timestamp: new Date().toISOString(),
			},
		}
	})
