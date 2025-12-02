import { Authorization } from "@/services/authorization"
import { Effect } from "effect"

export const getSession = Effect.fn(function* () {
  const authorizationService = yield* Authorization
  const session = yield* authorizationService.getSession()

  return {
    data: session,
    meta: {
      timestamp: new Date().toISOString(),
    },
  }
})
