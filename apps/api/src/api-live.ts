import { HttpApiBuilder } from "effect/unstable/httpapi"
import { HttpServerRequest } from "effect/unstable/http"
import type { ResponseError } from "effect/unstable/http/HttpClientError"
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
  ServiceUnavailable,
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
import { getRateLimiterStatus } from "./routes/v1/brawlhalla/get-rate-limiter-status"
import { searchGuild } from "./routes/v1/brawlhalla/search-guild"
import { getPowerRankings } from "./routes/v1/brawlhalla/get-power-rankings"
import {
  getServers,
  getNearestServer,
} from "./routes/v1/brawlhalla/get-servers"

const HealthLive = HttpApiBuilder.group(Api, "health", (handlers) =>
  handlers.handle("health", () => Effect.succeed("OK")),
)

const BrawlhallaLive = HttpApiBuilder.group(Api, "brawlhalla", (handlers) =>
  handlers
    .handle(
      "get-status-tokens",
      Effect.fn("get-status-tokens")(
        function* () {
          return yield* getRateLimiterStatus
        },
        flow(Effect.catch(() => Effect.fail(new InternalServerError()))),
      ),
    )
    .handle(
      "get-player-by-id",
      Effect.fn("get-player-by-id")(
        function* ({ params }) {
          return yield* getPlayerById(params.id)
        },
        flow(Effect.catchTags({
            BrawlhallaPlayerNotFound: () => Effect.fail(new NotFound()),
            BrawlhallaRateLimitError: () => Effect.fail(new TooManyRequests()),
            BrawlhallaServiceUnavailable: () =>
              Effect.fail(new ServiceUnavailable()),
            RateLimiterError: () => Effect.fail(new TooManyRequests()),
            BrawlhallaApiError: () => Effect.fail(new InternalServerError()),
            CacheOperationError: () => Effect.fail(new InternalServerError()),
            CacheSerializationError: () =>
              Effect.fail(new InternalServerError()),
          }), Effect.catch(() => Effect.fail(new InternalServerError()))),
      ),
    )
    .handle(
      "search-player",
      Effect.fn("search-player")(
        function* ({ query }) {
          return yield* searchPlayer(query.name)
        },
        flow(Effect.catch(() => Effect.fail(new InternalServerError()))),
      ),
    )
    .handle(
      "get-guild-by-id",
      Effect.fn("get-guild-by-id")(
        function* ({ params }) {
          return yield* getGuildById(params.id)
        },
        flow(Effect.catchTags({
            BrawlhallaClanNotFound: () => Effect.fail(new NotFound()),
            BrawlhallaRateLimitError: () => Effect.fail(new TooManyRequests()),
            BrawlhallaServiceUnavailable: () =>
              Effect.fail(new ServiceUnavailable()),
            RateLimiterError: () => Effect.fail(new TooManyRequests()),
            BrawlhallaApiError: () => Effect.fail(new InternalServerError()),
            CacheOperationError: () => Effect.fail(new InternalServerError()),
            CacheSerializationError: () =>
              Effect.fail(new InternalServerError()),
          }), Effect.catch(() => Effect.fail(new InternalServerError()))),
      ),
    )
    .handle(
      "get-ranked-1v1",
      Effect.fn("get-ranked-1v1")(
        function* ({ query }) {
          return yield* getRankings1v1(
            query.region,
            query.page,
            query.name,
          )
        },
        flow(Effect.catchTags({
            CacheOperationError: () => Effect.fail(new InternalServerError()),
            RateLimiterError: () => Effect.fail(new TooManyRequests()),
            BrawlhallaServiceUnavailable: () =>
              Effect.fail(new ServiceUnavailable()),
            CacheSerializationError: () =>
              Effect.fail(new InternalServerError()),
          }), Effect.catch(() => Effect.fail(new InternalServerError()))),
      ),
    )
    .handle(
      "get-ranked-2v2",
      Effect.fn("get-ranked-2v2")(
        function* ({ query }) {
          return yield* getRankings2v2(query.region, query.page)
        },
        flow(Effect.catchTags({
            BrawlhallaRateLimitError: () => Effect.fail(new TooManyRequests()),
            BrawlhallaServiceUnavailable: () =>
              Effect.fail(new ServiceUnavailable()),
            RateLimiterError: () => Effect.fail(new TooManyRequests()),
            BrawlhallaApiError: () => Effect.fail(new InternalServerError()),
            CacheOperationError: () => Effect.fail(new InternalServerError()),
            CacheSerializationError: () =>
              Effect.fail(new InternalServerError()),
          }), Effect.catch(() => Effect.fail(new InternalServerError()))),
      ),
    )
    .handle(
      "get-ranked-rotating",
      Effect.fn("get-ranked-rotating")(
        function* ({ query }) {
          return yield* getRankingsRotating(query.region, query.page)
        },
        flow(Effect.catchTags({
            BrawlhallaApiError: () => Effect.fail(new InternalServerError()),
            RateLimiterError: () => Effect.fail(new TooManyRequests()),
            BrawlhallaRateLimitError: () => Effect.fail(new TooManyRequests()),
            BrawlhallaServiceUnavailable: () =>
              Effect.fail(new ServiceUnavailable()),
            CacheOperationError: () => Effect.fail(new InternalServerError()),
            CacheSerializationError: () =>
              Effect.fail(new InternalServerError()),
          }), Effect.catch(() => Effect.fail(new InternalServerError()))),
      ),
    )
    .handle(
      "get-ranked-1v1-queue",
      Effect.fn("get-ranked-1v1-queue")(
        function* ({ query }) {
          return yield* getRanked1v1Queue(query.region)
        },
        flow(Effect.catchTags({
          }), Effect.catch(() => Effect.fail(new InternalServerError()))),
      ),
    )
    .handle(
      "get-ranked-2v2-queue",
      Effect.fn("get-ranked-2v2-queue")(
        function* ({ query }) {
          return yield* getRanked2v2Queue(query.region)
        },
        flow(Effect.catchTags({
          }), Effect.catch(() => Effect.fail(new InternalServerError()))),
      ),
    )
    .handle(
      "get-ranked-rotating-queue",
      Effect.fn("get-ranked-rotating-queue")(
        function* ({ query }) {
          return yield* getRankedRotatingQueue(query.region)
        },
        flow(Effect.catchTags({
          }), Effect.catch(() => Effect.fail(new InternalServerError()))),
      ),
    )
    .handle(
      "get-player-rankings",
      Effect.fn("get-player-rankings")(
        function* ({ query }) {
          return yield* getGlobalPlayerRankings(query.orderBy)
        },
        flow(Effect.catchTags({
          }), Effect.catch(() => Effect.fail(new InternalServerError()))),
      ),
    )
    .handle(
      "get-legend-rankings",
      Effect.fn("get-legend-rankings")(
        function* ({ params, query }) {
          return yield* getGlobalLegendRankings(params.id, query.orderBy)
        },
        flow(Effect.catchTags({
          }), Effect.catch(() => Effect.fail(new InternalServerError()))),
      ),
    )
    .handle(
      "get-weapon-rankings",
      Effect.fn("get-weapon-rankings")(
        function* ({ params, query }) {
          return yield* getGlobalWeaponRankings(params.name, query.orderBy)
        },
        flow(Effect.catchTags({
          }), Effect.catch(() => Effect.fail(new InternalServerError()))),
      ),
    )
    .handle(
      "get-weekly-rotation",
      Effect.fn("get-weekly-rotation")(
        function* () {
          return yield* getWeeklyRotation()
        },
        flow(
          Effect.catchTags({
            ResponseError: (error: ResponseError) =>
              Effect.gen(function* () {
                switch (error.response.status) {
                  case 404:
                    return yield* Effect.fail(new NotFound())
                  case 429:
                    return yield* Effect.fail(new TooManyRequests())
                  default:
                    return yield* Effect.fail(new InternalServerError())
                }
              }),
            SchemaError: () => Effect.fail(new InternalServerError()),
            RequestError: () => Effect.fail(new InternalServerError()),
            TimeoutException: () => Effect.fail(new InternalServerError()),
            HttpBodyError: () => Effect.fail(new InternalServerError()),
            WeeklyRotationError: () => Effect.fail(new NotFound()),
            CacheOperationError: () => Effect.fail(new InternalServerError()),
            CacheSerializationError: () =>
              Effect.fail(new InternalServerError()),
          }),
          Effect.catch(() => Effect.fail(new InternalServerError())),
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
          Effect.catchTags({
            ResponseError: (error: ResponseError) =>
              Effect.gen(function* () {
                switch (error.response.status) {
                  case 404:
                    return yield* Effect.fail(new NotFound())
                  case 429:
                    return yield* Effect.fail(new TooManyRequests())
                  default:
                    return yield* Effect.fail(new InternalServerError())
                }
              }),
            SchemaError: () => Effect.fail(new InternalServerError()),
            RequestError: () => Effect.fail(new InternalServerError()),
            TimeoutException: () => Effect.fail(new InternalServerError()),
            HttpBodyError: () => Effect.fail(new InternalServerError()),
            CacheOperationError: () => Effect.fail(new InternalServerError()),
            CacheSerializationError: () =>
              Effect.fail(new InternalServerError()),
          }),
          Effect.catch(() => Effect.fail(new InternalServerError())),
        ),
      ),
    )
    .handle(
      "search-guild",
      Effect.fn("search-guild")(
        function* ({ query }) {
          return yield* searchGuild({
            page: query.page,
            limit: query.limit,
            name: query.name,
          })
        },
        flow(Effect.catchTags({
          }), Effect.catch(() => Effect.fail(new InternalServerError()))),
      ),
    )
    .handle(
      "get-power-rankings",
      Effect.fn("get-power-rankings")(
        function* ({ query }) {
          return yield* getPowerRankings({
            region: query.region,
            page: query.page,
            orderBy: query.orderBy,
            gameMode: query.gameMode,
          })
        },
        flow(
          Effect.catchTags({
            BrawltoolsApiError: () => Effect.fail(new InternalServerError()),
          }),
          Effect.catch(() => Effect.fail(new InternalServerError())),
        ),
      ),
    )
    .handle(
      "get-servers",
      Effect.fn("get-servers")(function* () {
        return yield* getServers()
      }, flow(Effect.catch(() => Effect.fail(new InternalServerError())))),
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
      }, flow(Effect.catch(() => Effect.fail(new InternalServerError())))),
    ),
)

const AuthLive = HttpApiBuilder.group(Api, "auth", (handlers) =>
  handlers
    .handle(
      "authorize",
      Effect.fn("authorize")(function* ({ params, query }) {
        return yield* authorize(params.provider, query)
      }),
    )
    .handle(
      "get_session",
      Effect.fn("get_session")(
        function* () {
          return yield* getSession()
        },
        flow(Effect.catchTags({
          }), Effect.catch(() => Effect.fail(new InternalServerError()))),
      ),
    )
    .handle(
      "delete_session",
      Effect.fn("delete_session")(
        function* () {
          return yield* deleteSession()
        },
        flow(Effect.catchTags({
          }), Effect.catch(() => Effect.fail(new InternalServerError()))),
      ),
    )
    .handle(
      "logout",
      Effect.fn("logout")(
        function* () {
          return yield* deleteSession()
        },
        flow(Effect.catchTags({
          }), Effect.catch(() => Effect.fail(new InternalServerError()))),
      ),
    )
    .handle(
      "callback",
      Effect.fn("callback")(function* ({ params, query }) {
        return yield* providerCallback(
          params.provider,
          query.code,
          query.state,
        )
      }),
    ),
)

export const ApiLive = Layer.mergeAll(
  HealthLive,
  BrawlhallaLive,
  AuthLive,
)
