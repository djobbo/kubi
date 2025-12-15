import { HttpApiBuilder } from "@effect/platform"
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
} from "./routes/v1/brawlhalla/get-rankings"
import { getWeeklyRotation } from "./routes/v1/brawlhalla/get-weekly-rotation"
import {
  InternalServerError,
  NotFound,
  TooManyRequests,
} from "@dair/api-contract/src/shared/errors"
import { searchPlayer } from "./routes/v1/brawlhalla/search-player"
import { getGlobalPlayerRankings } from "./routes/v1/brawlhalla/get-global-player-rankings"
import { getGlobalLegendRankings } from "./routes/v1/brawlhalla/get-global-legend-rankings"
import { getGlobalWeaponRankings } from "./routes/v1/brawlhalla/get-global-weapon-rankings"

const HealthLive = HttpApiBuilder.group(Api, "health", (handlers) =>
  handlers.handle("health", () => Effect.succeed("OK")),
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
          }),
        ),
      ),
    )
    .handle(
      "get-rankings-1v1",
      Effect.fn("get-rankings-1v1")(function* ({ path, urlParams }) {
        return yield* getRankings1v1(path.region, path.page, urlParams.name)
      }),
    )
    .handle(
      "get-rankings-2v2",
      Effect.fn("get-rankings-2v2")(
        function* ({ path }) {
          return yield* getRankings2v2(path.region, path.page)
        },
        flow(
          Effect.tapError(Effect.logError),
          Effect.catchTags({
            BrawlhallaRateLimitError: () => Effect.fail(new TooManyRequests()),
            BrawlhallaApiError: () => Effect.fail(new InternalServerError()),
          }),
        ),
      ),
    )
    .handle(
      "get-global-player-rankings",
      Effect.fn("get-global-player-rankings")(
        function* ({ path }) {
          return yield* getGlobalPlayerRankings(path.sortBy)
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
      "get-global-legend-rankings",
      Effect.fn("get-global-legend-rankings")(function* ({ path }) {
        return yield* getGlobalLegendRankings(path.legendId, path.sortBy)
      }),
      flow(
        Effect.tapError(Effect.logError),
        Effect.catchTags({
          SqlError: () => Effect.fail(new InternalServerError()),
        }),
      ),
    )
    .handle(
      "get-global-weapon-rankings",
      Effect.fn("get-global-weapon-rankings")(function* ({ path }) {
        return yield* getGlobalWeaponRankings(path.weaponName, path.sortBy)
      }),
      flow(
        Effect.tapError(Effect.logError),
        Effect.catchTags({
          SqlError: () => Effect.fail(new InternalServerError()),
        }),
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
          }),
        ),
      ),
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
