import type { Provider } from "@dair/schema";
import { HttpServerResponse } from "@effect/platform";
import { Effect } from "effect";
import { Authorization } from "@/services/authorization";
import type { State } from "@dair/api-contract/src/routes/v1/auth/providers/callback";

export const authorize = Effect.fn(function* (
  provider: Provider,
  state: typeof State.Type
) {
  const authorizationService = yield* Authorization;

  const authorizationUrl = authorizationService
    .createAuthorizationURL(provider, state)
    .toString();

  return HttpServerResponse.redirect(authorizationUrl);
});
