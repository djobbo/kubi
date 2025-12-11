import { Authorization } from "@/services/authorization"
import type { Provider } from "@dair/db"
import { HttpServerResponse } from "@effect/platform"
import { Effect } from "effect"

export const providerCallback = (
  provider: Provider,
  code: string,
  state: string,
) =>
  Effect.gen(function* () {
    const authorizationService = yield* Authorization
    const user = yield* authorizationService.validateOAuthCallback(
      provider,
      code,
    )
    yield* authorizationService.createSession(user.id)
    const redirectUrl = yield* authorizationService.createRedirectUrl(state)

    return HttpServerResponse.redirect(redirectUrl)
  }).pipe(
    Effect.catchAll((e) =>
      Effect.gen(function* () {
        console.log(e)
        const authorizationService = yield* Authorization
        return HttpServerResponse.redirect(
          new URL("/error", authorizationService.defaultClientUrl),
        )
      }),
    ),
  )
