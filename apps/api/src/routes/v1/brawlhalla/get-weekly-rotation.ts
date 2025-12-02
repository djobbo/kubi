import { BrawlhallaGql } from "@/services/brawlhalla-gql"
import type { GetWeeklyRotationResponse } from "@dair/api-contract/src/routes/v1/brawlhalla/get-weekly-rotation"
import {
  InternalServerError,
  NotFound,
  TooManyRequests,
} from "@dair/api-contract/src/shared/errors"
import { Effect } from "effect"

export const getWeeklyRotation = () =>
  Effect.gen(function* () {
    // TODO: const session = yield* Authorization.getSession();

    const weeklyRotation = yield* BrawlhallaGql.getWeeklyRotation()

    const response: typeof GetWeeklyRotationResponse.Type = {
      data: weeklyRotation.data,
      meta: {
        updated_at: weeklyRotation.updatedAt,
      },
    }

    return response
  }).pipe(
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
    Effect.withSpan("get-weekly-rotation"),
  )
