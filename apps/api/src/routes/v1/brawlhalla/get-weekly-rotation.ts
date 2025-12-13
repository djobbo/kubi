import { BrawlhallaGql } from "@/services/brawlhalla-gql"
import type { GetWeeklyRotationResponse } from "@dair/api-contract/src/routes/v1/brawlhalla/get-weekly-rotation"
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
  })
