import {
  HttpApi,
  HttpApiEndpoint,
  HttpApiGroup,
  HttpApiSchema,
} from "@effect/platform";
import { Schema } from "effect";

import { providers } from "@dair/schema";
import { BadRequest, InternalServerError, NotFound, ServiceUnavailable, Unauthorized } from "@effect/platform/HttpApiError";
import { DeleteSessionResponse } from "./routes/auth/deleteSession/schema";
import { GetSessionResponse } from "./routes/auth/getSession/schema";
import {
  State,
} from "./routes/auth/providers/callback/schema";
import { GetPlayerByIdResponse } from "./routes/brawlhalla/get-player-by-id/schema";
import { GetClanByIdResponse } from './routes/brawlhalla/get-clan-by-id/schema';

const idParam = HttpApiSchema.param("id", Schema.NumberFromString);
const providerParam = HttpApiSchema.param(
  "provider",
  Schema.Literal(...providers)
);

class HealthGroup extends HttpApiGroup.make("health").add(
  HttpApiEndpoint.get("health")`/`.addSuccess(Schema.String)
) {}

class BrawlhallaGroup extends HttpApiGroup.make("brawlhalla").add(
  HttpApiEndpoint.get("get-player-by-id")`/players/${idParam}`
    .addSuccess(GetPlayerByIdResponse)
    .addError(NotFound, {status: 404})
    .addError(ServiceUnavailable, {status: 429})
    .addError(InternalServerError, {status: 500})
).add(HttpApiEndpoint.get("get-clan-by-id")`/clans/${idParam}`
    .addSuccess(GetClanByIdResponse)
    .addError(NotFound, {status: 404})
    .addError(ServiceUnavailable, {status: 429})
    .addError(InternalServerError, {status: 500})
) {}

class AuthGroup extends HttpApiGroup.make("auth")
  .add(
    HttpApiEndpoint.get("get_session")`/session`
      .addSuccess(GetSessionResponse)
      .addError(InternalServerError)
      .addError(Unauthorized)
  )
  .add(
    HttpApiEndpoint.del("delete_session")`/session`
      .addSuccess(DeleteSessionResponse)
      .addError(InternalServerError)
      .addError(Unauthorized)
  )
  .add(
    HttpApiEndpoint.get("logout")`/logout`
      .addSuccess(DeleteSessionResponse)
      .addError(InternalServerError)
      .addError(Unauthorized)
  )
  .add(
    HttpApiEndpoint.get("authorize")`/providers/${providerParam}/authorize`
      .setUrlParams(State)
      .addError(InternalServerError)
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
      .addError(InternalServerError)
  ) {}

export const Api = HttpApi.make("Api")
  .add(HealthGroup.prefix("/health"))
  .add(BrawlhallaGroup.prefix("/brawlhalla"))
  .add(AuthGroup.prefix("/auth"))
  .prefix("/v1");
