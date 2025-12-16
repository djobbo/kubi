import { HttpApiBuilder, HttpServerRequest } from "@effect/platform"
import { Effect, Layer, flow } from "effect"

import { Api } from "@dair/api-contract"
import { deleteSession } from "./routes/v1/auth/delete-session"
import { getSession } from "./routes/v1/auth/get-session"
import { authorize } from "./routes/v1/auth/providers/authorize"
import { providerCallback } from "./routes/v1/auth/providers/callback"
import { getGuildById } from "./routes/v1/brawlhalla/get-guild-by-id"
import { getPlayerById } from "./routes/v1/brawlhalla/get-player-by-id"
import { getPreviewArticles } from "./routes/v1/brawlhalla/get-preview-articles"
import {
  getRankings1v1,
  getRankings2v2,
  getRankingsRotating,
} from "./routes/v1/brawlhalla/get-rankings"
import { getWeeklyRotation } from "./routes/v1/brawlhalla/get-weekly-rotation"
import {
  InternalServerError,
  NotFound,
  TooManyRequests,
} from "@dair/api-contract/src/shared/errors"
import { searchPlayer } from "./routes/v1/brawlhalla/search-player"
import { getGlobalPlayerRankings } from "./routes/v1/brawlhalla/get-player-rankings"
import { getGlobalLegendRankings } from "./routes/v1/brawlhalla/get-legend-rankings"
import { getGlobalWeaponRankings } from "./routes/v1/brawlhalla/get-weapon-rankings"
import {
  getRanked1v1Queue,
  getRanked2v2Queue,
  getRankedRotatingQueue,
} from "./routes/v1/brawlhalla/get-ranked-queues"
import { getTokens } from "./routes/v1/health/get-tokens"
import { searchGuild } from "./routes/v1/brawlhalla/search-guild"
import { getPowerRankings } from "./routes/v1/brawlhalla/get-power-rankings"
import {
  getServers,
  getNearestServer,
} from "./routes/v1/brawlhalla/get-servers"

const HealthLive = HttpApiBuilder.group(Api, "health", (handlers) =>
  handlers
    .handle("health", () => Effect.succeed("OK"))
    .handle(
      "tokens",
      Effect.fn("tokens")(function* () {
        return yield* getTokens
      }),
    ),
)

const BrawlhallaLive = HttpApiBuilder.group(Api, "brawlhalla", (handlers) =>
  handlers
    .handle(
      "get-player-by-id",
      Effect.fn("get-player-by-id")(
        function* ({ path }) {
          return yield* getPlayerById(path.id)
        },
        flow(
          Effect.tapError(Effect.logError),
          Effect.catchTags({
            BrawlhallaPlayerNotFound: () => Effect.fail(new NotFound()),
            BrawlhallaRateLimitError: () => Effect.fail(new TooManyRequests()),
            BrawlhallaApiError: () => Effect.fail(new InternalServerError()),
            SqlError: () => Effect.fail(new InternalServerError()),
            CacheOperationError: () => Effect.fail(new InternalServerError()),
            CacheSerializationError: () =>
              Effect.fail(new InternalServerError()),
          }),
        ),
      ),
    )
    .handle(
      "search-player",
      Effect.fn("search-player")(
        function* ({ urlParams }) {
          return yield* searchPlayer(urlParams.name)
        },
        flow(
          Effect.tapError(Effect.logError),
          Effect.catchTags({
            SqlError: () => Effect.fail(new InternalServerError()),
          }),
        ),
      ),
    )
    .handle(
      "get-guild-by-id",
      Effect.fn("get-guild-by-id")(
        function* ({ path }) {
          return yield* getGuildById(path.id)
        },
        flow(
          Effect.tapError(Effect.logError),
          Effect.catchTags({
            BrawlhallaClanNotFound: () => Effect.fail(new NotFound()),
            BrawlhallaRateLimitError: () => Effect.fail(new TooManyRequests()),
            BrawlhallaApiError: () => Effect.fail(new InternalServerError()),
            CacheOperationError: () => Effect.fail(new InternalServerError()),
            CacheSerializationError: () =>
              Effect.fail(new InternalServerError()),
          }),
        ),
      ),
    )
    .handle(
      "get-ranked-1v1",
      Effect.fn("get-ranked-1v1")(
        function* ({ urlParams }) {
          return yield* getRankings1v1(
            urlParams.region,
            urlParams.page,
            urlParams.name,
          )
        },
        flow(
          Effect.tapError(Effect.logError),
          Effect.catchTags({
            CacheOperationError: () => Effect.fail(new InternalServerError()),
            CacheSerializationError: () =>
              Effect.fail(new InternalServerError()),
          }),
        ),
      ),
    )
    .handle(
      "get-ranked-2v2",
      Effect.fn("get-ranked-2v2")(
        function* ({ urlParams }) {
          return yield* getRankings2v2(urlParams.region, urlParams.page)
        },
        flow(
          Effect.tapError(Effect.logError),
          Effect.catchTags({
            BrawlhallaRateLimitError: () => Effect.fail(new TooManyRequests()),
            BrawlhallaApiError: () => Effect.fail(new InternalServerError()),
            CacheOperationError: () => Effect.fail(new InternalServerError()),
            CacheSerializationError: () =>
              Effect.fail(new InternalServerError()),
          }),
        ),
      ),
    )
    .handle(
      "get-ranked-rotating",
      Effect.fn("get-ranked-rotating")(
        function* ({ urlParams }) {
          return yield* getRankingsRotating(urlParams.region, urlParams.page)
        },
        flow(
          Effect.tapError(Effect.logError),
          Effect.catchTags({
            BrawlhallaApiError: () => Effect.fail(new InternalServerError()),
            BrawlhallaRateLimitError: () => Effect.fail(new TooManyRequests()),
            CacheOperationError: () => Effect.fail(new InternalServerError()),
            CacheSerializationError: () =>
              Effect.fail(new InternalServerError()),
          }),
        ),
      ),
    )
    .handle(
      "get-ranked-1v1-queue",
      Effect.fn("get-ranked-1v1-queue")(
        function* ({ urlParams }) {
          return yield* getRanked1v1Queue(urlParams.region)
        },
        flow(
          Effect.tapError(Effect.logError),
          Effect.catchTags({
            SqlError: () => Effect.fail(new InternalServerError()),
          }),
        ),
      ),
    )
    .handle(
      "get-ranked-2v2-queue",
      Effect.fn("get-ranked-2v2-queue")(
        function* ({ urlParams }) {
          return yield* getRanked2v2Queue(urlParams.region)
        },
        flow(
          Effect.tapError(Effect.logError),
          Effect.catchTags({
            SqlError: () => Effect.fail(new InternalServerError()),
          }),
        ),
      ),
    )
    .handle(
      "get-ranked-rotating-queue",
      Effect.fn("get-ranked-rotating-queue")(
        function* ({ urlParams }) {
          return yield* getRankedRotatingQueue(urlParams.region)
        },
        flow(
          Effect.tapError(Effect.logError),
          Effect.catchTags({
            SqlError: () => Effect.fail(new InternalServerError()),
          }),
        ),
      ),
    )
    .handle(
      "get-player-rankings",
      Effect.fn("get-player-rankings")(
        function* ({ urlParams }) {
          return yield* getGlobalPlayerRankings(urlParams.orderBy)
        },
        flow(
          Effect.tapError(Effect.logError),
          Effect.catchTags({
            SqlError: () => Effect.fail(new InternalServerError()),
          }),
        ),
      ),
    )
    .handle(
      "get-legend-rankings",
      Effect.fn("get-legend-rankings")(
        function* ({ path, urlParams }) {
          return yield* getGlobalLegendRankings(path.id, urlParams.orderBy)
        },
        flow(
          Effect.tapError(Effect.logError),
          Effect.catchTags({
            SqlError: () => Effect.fail(new InternalServerError()),
          }),
        ),
      ),
    )
    .handle(
      "get-weapon-rankings",
      Effect.fn("get-weapon-rankings")(
        function* ({ path, urlParams }) {
          return yield* getGlobalWeaponRankings(path.name, urlParams.orderBy)
        },
        flow(
          Effect.tapError(Effect.logError),
          Effect.catchTags({
            SqlError: () => Effect.fail(new InternalServerError()),
          }),
        ),
      ),
    )
    .handle(
      "get-weekly-rotation",
      Effect.fn("get-weekly-rotation")(
        function* () {
          return yield* getWeeklyRotation()
        },
        flow(
          Effect.tapError(Effect.logError),
          Effect.catchTags({
            ResponseError: Effect.fn(function* (error) {
              switch (error.response.status) {
                case 404:
                  return yield* Effect.fail(new NotFound())
                case 429:
                  return yield* Effect.fail(new TooManyRequests())
                default:
                  return yield* Effect.fail(new InternalServerError())
              }
            }),
            ParseError: () => Effect.fail(new InternalServerError()),
            RequestError: () => Effect.fail(new InternalServerError()),
            TimeoutException: () => Effect.fail(new InternalServerError()),
            HttpBodyError: () => Effect.fail(new InternalServerError()),
            WeeklyRotationError: () => Effect.fail(new NotFound()),
            CacheOperationError: () => Effect.fail(new InternalServerError()),
            CacheSerializationError: () =>
              Effect.fail(new InternalServerError()),
          }),
        ),
      ),
    )
    .handle(
      "get-preview-articles",
      Effect.fn("get-preview-articles")(
        function* () {
          return yield* getPreviewArticles()
        },
        flow(
          Effect.tapError(Effect.logError),
          Effect.catchTags({
            ResponseError: Effect.fn(function* (error) {
              switch (error.response.status) {
                case 404:
                  return yield* Effect.fail(new NotFound())
                case 429:
                  return yield* Effect.fail(new TooManyRequests())
                default:
                  return yield* Effect.fail(new InternalServerError())
              }
            }),
            ParseError: () => Effect.fail(new InternalServerError()),
            RequestError: () => Effect.fail(new InternalServerError()),
            TimeoutException: () => Effect.fail(new InternalServerError()),
            HttpBodyError: () => Effect.fail(new InternalServerError()),
            CacheOperationError: () => Effect.fail(new InternalServerError()),
            CacheSerializationError: () =>
              Effect.fail(new InternalServerError()),
          }),
        ),
      ),
    )
    .handle(
      "search-guild",
      Effect.fn("search-guild")(
        function* ({ urlParams }) {
          return yield* searchGuild({
            page: urlParams.page,
            limit: urlParams.limit,
            name: urlParams.name,
          })
        },
        flow(
          Effect.tapError(Effect.logError),
          Effect.catchTags({
            SqlError: () => Effect.fail(new InternalServerError()),
          }),
        ),
      ),
    )
    .handle(
      "get-power-rankings",
      Effect.fn("get-power-rankings")(
        function* ({ urlParams }) {
          return yield* getPowerRankings({
            region: urlParams.region,
            page: urlParams.page,
            orderBy: urlParams.orderBy,
            gameMode: urlParams.gameMode,
          })
        },
        flow(
          Effect.tapError(Effect.logError),
          Effect.catchTags({
            BrawltoolsApiError: () => Effect.fail(new InternalServerError()),
            CacheOperationError: () => Effect.fail(new InternalServerError()),
            CacheSerializationError: () =>
              Effect.fail(new InternalServerError()),
          }),
        ),
      ),
    )
    .handle(
      "get-servers",
      Effect.fn("get-servers")(function* () {
        return yield* getServers()
      }),
    )
    .handle(
      "get-nearest-server",
      Effect.fn("get-nearest-server")(function* () {
        // Get client IP from headers (x-forwarded-for for proxied requests)
        const request = yield* HttpServerRequest.HttpServerRequest
        const headers = request.headers
        const forwardedFor = headers["x-forwarded-for"]
        const ip = forwardedFor
          ? forwardedFor.split(",")[0]?.trim()
          : (headers["x-real-ip"] ?? null)
        return yield* getNearestServer(ip ?? null)
      }),
    ),
)

const AuthLive = HttpApiBuilder.group(Api, "auth", (handlers) =>
  handlers
    .handle(
      "authorize",
      Effect.fn("authorize")(function* ({ path, urlParams }) {
        return yield* authorize(path.provider, urlParams)
      }),
    )
    .handle(
      "get_session",
      Effect.fn("get_session")(
        function* () {
          return yield* getSession()
        },
        flow(
          Effect.tapError(Effect.logError),
          Effect.catchTags({
            SqlError: () => Effect.fail(new InternalServerError()),
          }),
        ),
      ),
    )
    .handle(
      "delete_session",
      Effect.fn("delete_session")(
        function* () {
          return yield* deleteSession()
        },
        flow(
          Effect.tapError(Effect.logError),
          Effect.catchTags({
            SqlError: () => Effect.fail(new InternalServerError()),
          }),
        ),
      ),
    )
    .handle(
      "logout",
      Effect.fn("logout")(
        function* () {
          return yield* deleteSession()
        },
        flow(
          Effect.tapError(Effect.logError),
          Effect.catchTags({
            SqlError: () => Effect.fail(new InternalServerError()),
          }),
        ),
      ),
    )
    .handle(
      "callback",
      Effect.fn("callback")(function* ({ path, urlParams }) {
        return yield* providerCallback(
          path.provider,
          urlParams.code,
          urlParams.state,
        )
      }),
    ),
)

export const ApiLive = HttpApiBuilder.api(Api).pipe(
  Layer.provide(HealthLive),
  Layer.provide(BrawlhallaLive),
  Layer.provide(AuthLive),
)
