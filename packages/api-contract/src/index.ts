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
  GetRankingsRotatingResponse,
} from "./routes/v1/brawlhalla/get-rankings"
import { GetWeeklyRotationResponse } from "./routes/v1/brawlhalla/get-weekly-rotation"
import { SearchPlayerResponse } from "./routes/v1/brawlhalla/search-player"
import {
  GetGlobalPlayerRankingsResponse,
  GlobalPlayerRankingsSortByParam,
} from "./routes/v1/brawlhalla/get-global-player-rankings"
import {
  GetGlobalLegendRankingsResponse,
  GlobalLegendRankingsSortByParam,
  LegendIdParam,
} from "./routes/v1/brawlhalla/get-global-legend-rankings"
import {
  GetGlobalWeaponRankingsResponse,
  GlobalWeaponRankingsSortByParam,
  WeaponNameParam,
} from "./routes/v1/brawlhalla/get-global-weapon-rankings"
import {
  GetRankedQueues1v1Response,
  GetRankedQueues2v2Response,
  GetRankedQueuesRotatingResponse,
} from "./routes/v1/brawlhalla/get-ranked-queues"
import { GetTokensResponse } from "./routes/v1/health/get-tokens"
import { SearchGuildResponse } from "./routes/v1/brawlhalla/search-guild"
import {
  GetPowerRankingsResponse,
  PowerRankingsGameMode,
  PowerRankingsOrderBy,
  PowerRankingsRegion,
} from "./routes/v1/brawlhalla/get-power-rankings"
import { GetLocationResponse } from "./routes/v1/brawlhalla/get-location"

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

class HealthGroup extends HttpApiGroup.make("health")
  .add(HttpApiEndpoint.get("health")`/`.addSuccess(Schema.String))
  .add(
    HttpApiEndpoint.get("tokens")`/tokens`
      .addSuccess(GetTokensResponse)
      .addError(InternalServerError),
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
    HttpApiEndpoint.get("search-guild")`/guilds/search`
      .setUrlParams(
        Schema.Struct({
          page: Schema.NumberFromString.pipe(
            Schema.greaterThanOrEqualTo(1),
            Schema.optionalWith({ default: () => 1 }),
          ),
          limit: Schema.NumberFromString.pipe(
            Schema.greaterThanOrEqualTo(1),
            Schema.lessThanOrEqualTo(100),
            Schema.optionalWith({ default: () => 50 }),
          ),
          name: Schema.String.pipe(Schema.optional),
        }),
      )
      .addSuccess(SearchGuildResponse)
      .addError(InternalServerError),
  )
  .add(
    HttpApiEndpoint.get(
      "get-ranked-1v1",
    )`/ranked/1v1/${regionParam}/${pageParam}`
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
      "get-ranked-2v2",
    )`/ranked/2v2/${regionParam}/${pageParam}`
      .addSuccess(GetRankings2v2Response)
      .addError(NotFound)
      .addError(TooManyRequests)
      .addError(InternalServerError),
  )
  .add(
    HttpApiEndpoint.get(
      "get-ranked-rotating",
    )`/ranked/rotating/${regionParam}/${pageParam}`
      .addSuccess(GetRankingsRotatingResponse)
      .addError(NotFound)
      .addError(TooManyRequests)
      .addError(InternalServerError),
  )
  .add(
    HttpApiEndpoint.get(
      "get-ranked-queues-1v1",
    )`/ranked/queues/1v1/${regionParam}`
      .addSuccess(GetRankedQueues1v1Response)
      .addError(NotFound)
      .addError(TooManyRequests)
      .addError(InternalServerError),
  )
  .add(
    HttpApiEndpoint.get(
      "get-ranked-queues-2v2",
    )`/ranked/queues/2v2/${regionParam}`
      .addSuccess(GetRankedQueues2v2Response)
      .addError(NotFound)
      .addError(TooManyRequests)
      .addError(InternalServerError),
  )
  .add(
    HttpApiEndpoint.get(
      "get-ranked-queues-rotating",
    )`/ranked/queues/rotating/${regionParam}`
      .addSuccess(GetRankedQueuesRotatingResponse)
      .addError(NotFound)
      .addError(TooManyRequests)
      .addError(InternalServerError),
  )
  .add(
    HttpApiEndpoint.get(
      "get-global-player-rankings",
    )`/rankings/players/${GlobalPlayerRankingsSortByParam}`
      .addSuccess(GetGlobalPlayerRankingsResponse)
      .addError(InternalServerError),
  )
  .add(
    HttpApiEndpoint.get(
      "get-global-legend-rankings",
    )`/rankings/legends/${LegendIdParam}/${GlobalLegendRankingsSortByParam}`
      .addSuccess(GetGlobalLegendRankingsResponse)
      .addError(InternalServerError),
  )
  .add(
    HttpApiEndpoint.get(
      "get-global-weapon-rankings",
    )`/rankings/weapons/${WeaponNameParam}/${GlobalWeaponRankingsSortByParam}`
      .addSuccess(GetGlobalWeaponRankingsResponse)
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
  )
  .add(
    HttpApiEndpoint.get(
      "get-power-rankings",
    )`/rankings/power/${HttpApiSchema.param("gameMode", PowerRankingsGameMode)}/${HttpApiSchema.param("region", PowerRankingsRegion)}/${pageParam}`
      .setUrlParams(
        Schema.Struct({
          orderBy: PowerRankingsOrderBy.pipe(
            Schema.optionalWith({ default: () => "powerRanking" as const }),
          ),
        }),
      )
      .addSuccess(GetPowerRankingsResponse)
      .addError(TooManyRequests)
      .addError(InternalServerError),
  )
  .add(
    HttpApiEndpoint.get("get-location")`/location`
      .addSuccess(GetLocationResponse)
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
