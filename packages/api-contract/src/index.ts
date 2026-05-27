import { Schema } from "effect"
import { HttpApi, HttpApiEndpoint, HttpApiGroup } from "effect/unstable/httpapi"
import { providers } from "@dair/db"
import {
  BadRequest,
  InternalServerError,
  NotFound,
  Unauthorized,
  TooManyRequests,
  ServiceUnavailable,
} from "./shared/errors"
import { AnyRegion } from "./shared/region"
import { withDecodingDefault } from "./shared/schema-helpers"
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
} from "./routes/v1/brawlhalla/get-legend-rankings"
import {
  GetGlobalWeaponRankingsResponse,
  GlobalWeaponRankingsOrderBy,
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

const Provider = Schema.Literals([...providers])

const rankedErrors = [
  NotFound,
  TooManyRequests,
  ServiceUnavailable,
  InternalServerError,
] as const

const pageParam = Schema.NumberFromString.check(
  Schema.isGreaterThanOrEqualTo(1),
)

class HealthGroup extends HttpApiGroup.make("health").add(
  HttpApiEndpoint.get("health", "/", {
    success: Schema.String,
  }),
) {}

class BrawlhallaGroup extends HttpApiGroup.make("brawlhalla")
  .add(
    HttpApiEndpoint.get("get-status-tokens", "/status/tokens", {
      success: GetRateLimiterStatusResponse,
      error: [InternalServerError],
    }),
  )
  .add(
    HttpApiEndpoint.get("get-player-by-id", "/players/:id", {
      params: { id: Schema.NumberFromString },
      success: GetPlayerByIdResponse,
      error: rankedErrors,
    }),
  )
  .add(
    HttpApiEndpoint.get("search-player", "/players/search", {
      query: {
        name: Schema.String.check(Schema.isMinLength(3)),
      },
      success: SearchPlayerResponse,
      error: [BadRequest, InternalServerError],
    }),
  )
  .add(
    HttpApiEndpoint.get("get-player-rankings", "/players/rankings", {
      query: {
        orderBy: withDecodingDefault(GlobalPlayerRankingsOrderBy, "xp"),
      },
      success: GetGlobalPlayerRankingsResponse,
      error: [InternalServerError],
    }),
  )
  .add(
    HttpApiEndpoint.get("get-guild-by-id", "/guilds/:id", {
      params: { id: Schema.NumberFromString },
      success: GetClanByIdResponse,
      error: rankedErrors,
    }),
  )
  .add(
    HttpApiEndpoint.get("search-guild", "/guilds/search", {
      query: {
        page: withDecodingDefault(pageParam, 1),
        limit: withDecodingDefault(
          pageParam.check(Schema.isLessThanOrEqualTo(100)),
          50,
        ),
        name: Schema.optional(Schema.String),
      },
      success: SearchGuildResponse,
      error: [InternalServerError],
    }),
  )
  .add(
    HttpApiEndpoint.get("get-ranked-1v1", "/ranked/1v1", {
      query: {
        name: Schema.optional(Schema.String),
        region: withDecodingDefault(AnyRegion, "all"),
        page: withDecodingDefault(pageParam, 1),
      },
      success: GetRankings1v1Response,
      error: rankedErrors,
    }),
  )
  .add(
    HttpApiEndpoint.get("get-ranked-1v1-queue", "/ranked/1v1/queue", {
      query: {
        region: withDecodingDefault(AnyRegion, "all"),
      },
      success: GetRankedQueues1v1Response,
      error: [NotFound, TooManyRequests, InternalServerError],
    }),
  )
  .add(
    HttpApiEndpoint.get("get-ranked-2v2", "/ranked/2v2", {
      query: {
        region: withDecodingDefault(AnyRegion, "all"),
        page: withDecodingDefault(pageParam, 1),
      },
      success: GetRankings2v2Response,
      error: rankedErrors,
    }),
  )
  .add(
    HttpApiEndpoint.get("get-ranked-2v2-queue", "/ranked/2v2/queue", {
      query: {
        region: withDecodingDefault(AnyRegion, "all"),
      },
      success: GetRankedQueues2v2Response,
      error: [NotFound, TooManyRequests, InternalServerError],
    }),
  )
  .add(
    HttpApiEndpoint.get("get-ranked-rotating", "/ranked/rotating", {
      query: {
        region: withDecodingDefault(AnyRegion, "all"),
        page: withDecodingDefault(pageParam, 1),
      },
      success: GetRankingsRotatingResponse,
      error: rankedErrors,
    }),
  )
  .add(
    HttpApiEndpoint.get("get-ranked-rotating-queue", "/ranked/rotating/queue", {
      query: {
        region: withDecodingDefault(AnyRegion, "all"),
      },
      success: GetRankedQueuesRotatingResponse,
      error: [NotFound, TooManyRequests, InternalServerError],
    }),
  )
  .add(
    HttpApiEndpoint.get("get-power-rankings", "/power-rankings", {
      query: {
        gameMode: withDecodingDefault(PowerRankingsGameMode, "1v1"),
        region: withDecodingDefault(PowerRankingsRegion, "LAN"),
        page: withDecodingDefault(pageParam, 1),
        orderBy: withDecodingDefault(PowerRankingsOrderBy, "powerRanking"),
      },
      success: GetPowerRankingsResponse,
      error: [TooManyRequests, InternalServerError],
    }),
  )
  .add(
    HttpApiEndpoint.get("get-legend-rankings", "/legends/:id/rankings", {
      params: { id: Schema.NumberFromString },
      query: {
        orderBy: withDecodingDefault(GlobalLegendRankingsOrderBy, "xp"),
      },
      success: GetGlobalLegendRankingsResponse,
      error: [InternalServerError],
    }),
  )
  .add(
    HttpApiEndpoint.get("get-weekly-rotation", "/legends/rotation", {
      success: GetWeeklyRotationResponse,
      error: [NotFound, TooManyRequests, InternalServerError],
    }),
  )
  .add(
    HttpApiEndpoint.get("get-weapon-rankings", "/weapons/:name/rankings", {
      params: { name: Schema.NonEmptyString },
      query: {
        orderBy: withDecodingDefault(GlobalWeaponRankingsOrderBy, "xp"),
      },
      success: GetGlobalWeaponRankingsResponse,
      error: [InternalServerError],
    }),
  )
  .add(
    HttpApiEndpoint.get("get-preview-articles", "/articles/preview", {
      success: GetPreviewArticlesResponse,
      error: [NotFound, TooManyRequests, InternalServerError],
    }),
  )
  .add(
    HttpApiEndpoint.get("get-servers", "/servers", {
      success: GetServersResponse,
      error: [InternalServerError],
    }),
  )
  .add(
    HttpApiEndpoint.get("get-nearest-server", "/servers/nearest", {
      success: GetNearestServerResponse,
      error: [InternalServerError],
    }),
  ) {}

class AuthGroup extends HttpApiGroup.make("auth")
  .add(
    HttpApiEndpoint.get("get_session", "/session", {
      success: GetSessionResponse,
      error: [InternalServerError, Unauthorized],
    }),
  )
  .add(
    HttpApiEndpoint.delete("delete_session", "/session", {
      success: DeleteSessionResponse,
      error: [InternalServerError, Unauthorized],
    }),
  )
  .add(
    HttpApiEndpoint.get("logout", "/logout", {
      success: DeleteSessionResponse,
      error: [InternalServerError, Unauthorized],
    }),
  )
  .add(
    HttpApiEndpoint.get("authorize", "/providers/:provider/authorize", {
      params: { provider: Provider },
      query: {
        path: Schema.UndefinedOr(Schema.String),
        baseUrl: Schema.UndefinedOr(Schema.String),
      },
      error: [InternalServerError, Unauthorized],
    }),
  )
  .add(
    HttpApiEndpoint.get("callback", "/providers/:provider/callback", {
      params: { provider: Provider },
      query: {
        code: Schema.String,
        state: Schema.String,
      },
      success: Schema.Struct({}),
      error: [Unauthorized, BadRequest, InternalServerError],
    }),
  ) {}

export const Api = HttpApi.make("Api")
  .add(HealthGroup.prefix("/health"))
  .add(BrawlhallaGroup.prefix("/brawlhalla"))
  .add(AuthGroup.prefix("/auth"))
  .prefix("/v1")
