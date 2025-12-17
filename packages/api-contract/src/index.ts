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
  GlobalPlayerRankingsOrderBy,
} from "./routes/v1/brawlhalla/get-player-rankings"
import {
  GetGlobalLegendRankingsResponse,
  GlobalLegendRankingsOrderBy,
  LegendIdParam,
} from "./routes/v1/brawlhalla/get-legend-rankings"
import {
  GetGlobalWeaponRankingsResponse,
  GlobalWeaponRankingsOrderBy,
  WeaponNameParam,
} from "./routes/v1/brawlhalla/get-weapon-rankings"
import {
  GetRankedQueues1v1Response,
  GetRankedQueues2v2Response,
  GetRankedQueuesRotatingResponse,
} from "./routes/v1/brawlhalla/get-ranked-queues"
import { GetRateLimiterStatusResponse } from "./routes/v1/brawlhalla/get-rate-limiter-status"
import { SearchGuildResponse } from "./routes/v1/brawlhalla/search-guild"
import {
  GetPowerRankingsResponse,
  PowerRankingsGameMode,
  PowerRankingsOrderBy,
  PowerRankingsRegion,
} from "./routes/v1/brawlhalla/get-power-rankings"
import {
  GetServersResponse,
  GetNearestServerResponse,
} from "./routes/v1/brawlhalla/get-servers"
import { WorkerSuccessResponse } from "./shared/workers"

const idParam = HttpApiSchema.param("id", Schema.NumberFromString)
const providerParam = HttpApiSchema.param(
  "provider",
  Schema.Literal(...providers),
)

class HealthGroup extends HttpApiGroup.make("health").add(
  HttpApiEndpoint.get("health")`/`.addSuccess(Schema.String),
) {}

class BrawlhallaGroup extends HttpApiGroup.make("brawlhalla")
  .add(
    HttpApiEndpoint.get("get-status-tokens")`/status/tokens`
      .addSuccess(GetRateLimiterStatusResponse)
      .addError(InternalServerError),
  )
  .add(
    HttpApiEndpoint.get("get-player-by-id")`/players/${idParam}`
      .addSuccess(GetPlayerByIdResponse)
      .addError(WorkerSuccessResponse)
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
    HttpApiEndpoint.get("get-player-rankings")`/players/rankings`
      .setUrlParams(
        Schema.Struct({
          orderBy: GlobalPlayerRankingsOrderBy.pipe(
            Schema.optionalWith({ default: () => "xp" }),
          ),
        }),
      )
      .addSuccess(GetGlobalPlayerRankingsResponse)
      .addError(InternalServerError),
  )
  .add(
    HttpApiEndpoint.get("get-guild-by-id")`/guilds/${idParam}`
      .addSuccess(GetClanByIdResponse)
      .addError(WorkerSuccessResponse)
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
  // TODO: add /guilds/rankings
  .add(
    HttpApiEndpoint.get("get-ranked-1v1")`/ranked/1v1`
      .setUrlParams(
        Schema.Struct({
          name: Schema.String.pipe(Schema.optional),
          region: AnyRegion.pipe(Schema.optionalWith({ default: () => "all" })),
          page: Schema.NumberFromString.pipe(
            Schema.greaterThanOrEqualTo(1),
            Schema.optionalWith({ default: () => 1 }),
          ),
        }),
      )
      .addSuccess(GetRankings1v1Response)
      .addError(WorkerSuccessResponse)
      .addError(NotFound)
      .addError(TooManyRequests)
      .addError(InternalServerError),
  )
  .add(
    HttpApiEndpoint.get("get-ranked-1v1-queue")`/ranked/1v1/queue`
      .setUrlParams(
        Schema.Struct({
          region: AnyRegion.pipe(Schema.optionalWith({ default: () => "all" })),
        }),
      )
      .addSuccess(GetRankedQueues1v1Response)
      .addError(NotFound)
      .addError(TooManyRequests)
      .addError(InternalServerError),
  )
  .add(
    HttpApiEndpoint.get("get-ranked-2v2")`/ranked/2v2`
      .setUrlParams(
        Schema.Struct({
          region: AnyRegion.pipe(Schema.optionalWith({ default: () => "all" })),
          page: Schema.NumberFromString.pipe(
            Schema.greaterThanOrEqualTo(1),
            Schema.optionalWith({ default: () => 1 }),
          ),
        }),
      )
      .addSuccess(GetRankings2v2Response)
      .addError(WorkerSuccessResponse)
      .addError(NotFound)
      .addError(TooManyRequests)
      .addError(InternalServerError),
  )

  .add(
    HttpApiEndpoint.get("get-ranked-2v2-queue")`/ranked/2v2/queue`
      .setUrlParams(
        Schema.Struct({
          region: AnyRegion.pipe(Schema.optionalWith({ default: () => "all" })),
        }),
      )
      .addSuccess(GetRankedQueues2v2Response)
      .addError(NotFound)
      .addError(TooManyRequests)
      .addError(InternalServerError),
  )
  .add(
    HttpApiEndpoint.get("get-ranked-rotating")`/ranked/rotating`
      .setUrlParams(
        Schema.Struct({
          region: AnyRegion.pipe(Schema.optionalWith({ default: () => "all" })),
          page: Schema.NumberFromString.pipe(
            Schema.greaterThanOrEqualTo(1),
            Schema.optionalWith({ default: () => 1 }),
          ),
        }),
      )
      .addSuccess(GetRankingsRotatingResponse)
      .addError(WorkerSuccessResponse)
      .addError(NotFound)
      .addError(TooManyRequests)
      .addError(InternalServerError),
  )
  .add(
    HttpApiEndpoint.get("get-ranked-rotating-queue")`/ranked/rotating/queue`
      .setUrlParams(
        Schema.Struct({
          region: AnyRegion.pipe(Schema.optionalWith({ default: () => "all" })),
        }),
      )
      .addSuccess(GetRankedQueuesRotatingResponse)
      .addError(NotFound)
      .addError(TooManyRequests)
      .addError(InternalServerError),
  )
  .add(
    HttpApiEndpoint.get("get-power-rankings")`/power-rankings`
      .setUrlParams(
        Schema.Struct({
          gameMode: PowerRankingsGameMode.pipe(
            Schema.optionalWith({ default: () => "1v1" }),
          ),
          region: PowerRankingsRegion.pipe(
            Schema.optionalWith({ default: () => "LAN" }),
          ),
          page: Schema.NumberFromString.pipe(
            Schema.greaterThanOrEqualTo(1),
            Schema.optionalWith({ default: () => 1 }),
          ),
          orderBy: PowerRankingsOrderBy.pipe(
            Schema.optionalWith({ default: () => "powerRanking" }),
          ),
        }),
      )
      .addSuccess(GetPowerRankingsResponse)
      .addError(TooManyRequests)
      .addError(InternalServerError),
  )
  .add(
    HttpApiEndpoint.get(
      "get-legend-rankings",
    )`/legends/${LegendIdParam}/rankings`
      .setUrlParams(
        Schema.Struct({
          orderBy: GlobalLegendRankingsOrderBy.pipe(
            Schema.optionalWith({ default: () => "xp" }),
          ),
        }),
      )
      .addSuccess(GetGlobalLegendRankingsResponse)
      .addError(InternalServerError),
  )
  .add(
    HttpApiEndpoint.get("get-weekly-rotation")`/legends/rotation`
      .addSuccess(GetWeeklyRotationResponse)
      .addError(NotFound)
      .addError(TooManyRequests)
      .addError(InternalServerError),
  )
  .add(
    HttpApiEndpoint.get(
      "get-weapon-rankings",
    )`/weapons/${WeaponNameParam}/rankings`
      .setUrlParams(
        Schema.Struct({
          orderBy: GlobalWeaponRankingsOrderBy.pipe(
            Schema.optionalWith({ default: () => "xp" }),
          ),
        }),
      )
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
    HttpApiEndpoint.get("get-servers")`/servers`
      .addSuccess(GetServersResponse)
      .addError(InternalServerError),
  )
  .add(
    HttpApiEndpoint.get("get-nearest-server")`/servers/nearest`
      .addSuccess(GetNearestServerResponse)
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
