import {
  HttpApi,
  HttpApiEndpoint,
  HttpApiGroup,
  HttpApiSchema,
} from "@effect/platform"
import { Schema } from "effect"

import { providers } from "@dair/db"
import {
  BadRequest,
  InternalServerError,
  NotFound,
  Unauthorized,
  TooManyRequests,
} from "./shared/errors"
import { AnyRegion } from "./shared/region"
import { DeleteSessionResponse } from "./routes/v1/auth/delete-session"
import { GetSessionResponse } from "./routes/v1/auth/get-session"
import { State } from "./routes/v1/auth/providers/callback"
import { GetClanByIdResponse } from "./routes/v1/brawlhalla/get-guild-by-id"
import { GetPlayerByIdResponse } from "./routes/v1/brawlhalla/get-player-by-id"
import { GetPreviewArticlesResponse } from "./routes/v1/brawlhalla/get-preview-articles"
import {
  GetRankings1v1Response,
  GetRankings2v2Response,
} from "./routes/v1/brawlhalla/get-rankings"
import { GetWeeklyRotationResponse } from "./routes/v1/brawlhalla/get-weekly-rotation"
import { SearchPlayerResponse } from "./routes/v1/brawlhalla/search-player"
import {
  GetPlayerRankingsResponse,
  GlobalPlayerRankingsSortByParam,
} from "./routes/v1/brawlhalla/get-player-rankings"

const idParam = HttpApiSchema.param("id", Schema.NumberFromString)
const pageParam = HttpApiSchema.param(
  "page",
  Schema.NumberFromString.pipe(Schema.greaterThanOrEqualTo(1)),
)
const regionParam = HttpApiSchema.param("region", AnyRegion)
const providerParam = HttpApiSchema.param(
  "provider",
  Schema.Literal(...providers),
)

class HealthGroup extends HttpApiGroup.make("health").add(
  HttpApiEndpoint.get("health")`/`.addSuccess(Schema.String),
) {}

class BrawlhallaGroup extends HttpApiGroup.make("brawlhalla")
  .add(
    HttpApiEndpoint.get("get-player-by-id")`/players/${idParam}`
      .addSuccess(GetPlayerByIdResponse)
      .addError(NotFound)
      .addError(TooManyRequests)
      .addError(InternalServerError),
  )
  .add(
    HttpApiEndpoint.get("search-player")`/players/search`
      .setUrlParams(
        Schema.Struct({
          name: Schema.String.pipe(Schema.minLength(3)),
        }),
      )
      .addSuccess(SearchPlayerResponse)
      .addError(BadRequest)
      .addError(InternalServerError),
  )
  .add(
    HttpApiEndpoint.get("get-guild-by-id")`/guilds/${idParam}`
      .addSuccess(GetClanByIdResponse)
      .addError(NotFound)
      .addError(TooManyRequests)
      .addError(InternalServerError),
  )
  .add(
    HttpApiEndpoint.get(
      "get-rankings-1v1",
    )`/rankings/1v1/${regionParam}/${pageParam}`
      .addSuccess(GetRankings1v1Response)
      .setUrlParams(
        Schema.Struct({
          name: Schema.String.pipe(Schema.optional),
        }),
      )
      .addError(NotFound)
      .addError(TooManyRequests)
      .addError(InternalServerError),
  )
  .add(
    HttpApiEndpoint.get(
      "get-rankings-2v2",
    )`/rankings/2v2/${regionParam}/${pageParam}`
      .addSuccess(GetRankings2v2Response)
      .addError(NotFound)
      .addError(TooManyRequests)
      .addError(InternalServerError),
  )
  .add(
    HttpApiEndpoint.get(
      "get-player-rankings",
    )`/rankings/global/${GlobalPlayerRankingsSortByParam}`
      .addSuccess(GetPlayerRankingsResponse)
      .addError(InternalServerError),
  )
  .add(
    HttpApiEndpoint.get("get-preview-articles")`/articles/preview`
      .addSuccess(GetPreviewArticlesResponse)
      .addError(NotFound)
      .addError(TooManyRequests)
      .addError(InternalServerError),
  )
  .add(
    HttpApiEndpoint.get("get-weekly-rotation")`/weekly-rotation`
      .addSuccess(GetWeeklyRotationResponse)
      .addError(NotFound)
      .addError(TooManyRequests)
      .addError(InternalServerError),
  ) {}

class AuthGroup extends HttpApiGroup.make("auth")
  .add(
    HttpApiEndpoint.get("get_session")`/session`
      .addSuccess(GetSessionResponse)
      .addError(InternalServerError)
      .addError(Unauthorized),
  )
  .add(
    HttpApiEndpoint.del("delete_session")`/session`
      .addSuccess(DeleteSessionResponse)
      .addError(InternalServerError)
      .addError(Unauthorized),
  )
  .add(
    HttpApiEndpoint.get("logout")`/logout`
      .addSuccess(DeleteSessionResponse)
      .addError(InternalServerError)
      .addError(Unauthorized),
  )
  .add(
    HttpApiEndpoint.get("authorize")`/providers/${providerParam}/authorize`
      .setUrlParams(State)
      .addError(InternalServerError)
      .addError(Unauthorized),
  )
  .add(
    HttpApiEndpoint.get("callback")`/providers/${providerParam}/callback`
      .setUrlParams(
        Schema.Struct({
          code: Schema.String,
          state: Schema.String,
        }),
      )
      .addSuccess(Schema.Struct({}))
      .addError(Unauthorized)
      .addError(BadRequest)
      .addError(InternalServerError),
  ) {}

export const Api = HttpApi.make("Api")
  .add(HealthGroup.prefix("/health"))
  .add(BrawlhallaGroup.prefix("/brawlhalla"))
  .add(AuthGroup.prefix("/auth"))
  .prefix("/v1")
