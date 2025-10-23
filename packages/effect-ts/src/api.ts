import {
  HttpApi,
  HttpApiBuilder,
  HttpApiEndpoint,
  HttpApiGroup,
  HttpApiSchema,
} from "@effect/platform";
import { Effect, Layer, Schema } from "effect";

import { providers } from "@dair/schema";
import { BadRequest, Unauthorized } from "@effect/platform/HttpApiError";
import { deleteSession } from "./routes/auth/deleteSession/handler";
import { DeleteSessionResponse } from "./routes/auth/deleteSession/schema";
import { getSession } from "./routes/auth/getSession/handler";
import { GetSessionResponse } from "./routes/auth/getSession/schema";
import { authorize } from "./routes/auth/providers/authorize/handler";
import {
  State,
  providerCallback,
} from "./routes/auth/providers/callback/handler";
import { getPlayer } from "./routes/brawlhalla/get-player/handler";
import { GetPlayerResponse } from "./routes/brawlhalla/get-player/schema";
import { DBError } from "./services/db";

const idParam = HttpApiSchema.param("id", Schema.NumberFromString);
const providerParam = HttpApiSchema.param(
  "provider",
  Schema.Literal(...providers)
);

class PlayerNotFound extends Schema.TaggedError<PlayerNotFound>()(
  "PlayerNotFound",
  {}
) {}

class RateLimited extends Schema.TaggedError<RateLimited>()(
  "RateLimited",
  {}
) {}

class InternalServerError extends Schema.TaggedError<InternalServerError>()(
  "InternalServerError",
  {}
) {}

class HealthGroup extends HttpApiGroup.make("health").add(
  HttpApiEndpoint.get("health")`/`.addSuccess(Schema.String)
) {}

class BrawlhallaGroup extends HttpApiGroup.make("brawlhalla").add(
  HttpApiEndpoint.get("get-player-by-id")`/players/${idParam}`
    .addSuccess(GetPlayerResponse)
    .addError(PlayerNotFound, {status: 404})
    .addError(RateLimited, {status: 429})
    .addError(InternalServerError, {status: 500})
) {}

class AuthGroup extends HttpApiGroup.make("auth")
  .add(
    HttpApiEndpoint.get("get_session")`/session`
      .addSuccess(GetSessionResponse)
      .addError(DBError)
      .addError(Unauthorized)
  )
  .add(
    HttpApiEndpoint.del("delete_session")`/session`
      .addSuccess(DeleteSessionResponse)
      .addError(DBError)
      .addError(Unauthorized)
  )
  .add(
    HttpApiEndpoint.get("logout")`/logout`
      .addSuccess(DeleteSessionResponse)
      .addError(DBError)
      .addError(Unauthorized)
  )
  .add(
    HttpApiEndpoint.get("authorize")`/providers/${providerParam}/authorize`
      .setUrlParams(State)
      .addError(DBError)
      .addError(Unauthorized)
  )
  .add(
    HttpApiEndpoint.get("callback")`/providers/${providerParam}/callback`
      .setUrlParams(
        Schema.Struct({
          code: Schema.String,
          state: Schema.String,
        })
      )
      .addSuccess(Schema.Struct({}))
      .addError(Unauthorized)
      .addError(BadRequest)
      .addError(DBError)
  ) {}

export const Api = HttpApi.make("Api")
  .add(HealthGroup.prefix("/health"))
  .add(BrawlhallaGroup.prefix("/brawlhalla"))
  .add(AuthGroup.prefix("/auth"))
  .prefix("/v1");

const HealthLive = HttpApiBuilder.group(Api, "health", (handlers) =>
  handlers.handle("health", () => Effect.succeed("OK"))
);

const BrawlhallaLive = HttpApiBuilder.group(Api, "brawlhalla", (handlers) =>
  handlers.handle("get-player-by-id", ({ path }) =>
    getPlayer(path.id).pipe(
      Effect.catchTags({
        ResponseError: Effect.fn(function* (error) {
          switch (error.response.status) {
            case 404:
              return yield* Effect.fail(new PlayerNotFound());
            case 429:
              return yield* Effect.fail(new RateLimited());
            default:
              return yield* Effect.fail(new InternalServerError());
          }
        }),
        ArchiveError: () => Effect.fail(new InternalServerError()),
        DBError: () => Effect.fail(new InternalServerError()),
        ParseError: () => Effect.fail(new InternalServerError()),
        RequestError: () => Effect.fail(new InternalServerError()),
        TimeoutException: () => Effect.fail(new InternalServerError()),
        ConfigError: Effect.die,
      })
    )
  )
);

const AuthLive = HttpApiBuilder.group(Api, "auth", (handlers) =>
  handlers
    .handle("authorize", ({ path, urlParams }) =>
      authorize(path.provider, urlParams)
    )
    .handle("get_session", () => getSession())
    .handle("delete_session", () => deleteSession())
    .handle("logout", () => deleteSession())
    .handle("callback", ({ path, urlParams }) => {
      return providerCallback(path.provider, urlParams.code, urlParams.state);
    })
);

export const ApiLive = HttpApiBuilder.api(Api).pipe(
  Layer.provide(HealthLive),
  Layer.provide(BrawlhallaLive),
  Layer.provide(AuthLive)
);
