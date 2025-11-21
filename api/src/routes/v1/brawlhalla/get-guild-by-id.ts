import { BrawlhallaApi } from "@/services/brawlhalla-api"
import type {
  Clan,
  GetClanByIdResponse,
} from "@dair/api-contract/src/routes/v1/brawlhalla/get-guild-by-id"
import {
  InternalServerError,
  NotFound,
  TooManyRequests,
} from "@dair/api-contract/src/shared/errors"
import { Effect } from "effect"

export const getGuildById = (clanId: number) =>
  Effect.gen(function* () {
    // TODO: const session = yield* Authorization.getSession();

    const brawlhallaApi = yield* BrawlhallaApi
    const clanStats = yield* brawlhallaApi.getClanById(clanId)

    const clanData: typeof Clan.Type = {
      id: clanStats.data.clan_id,
      name: clanStats.data.clan_name,
      created_at: clanStats.data.clan_create_date,
      xp: clanStats.data.clan_xp,
      lifetime_xp: clanStats.data.clan_lifetime_xp,
      members: clanStats.data.clan.map((member) => ({
        id: member.brawlhalla_id,
        name: member.name,
        rank: member.rank,
        joined_at: member.join_date,
        // TODO: Add current guild xp when Brawlhalla's API is updated
        xp: 0,
        lifetime_xp: member.xp,
      })),
      bookmark: null,
    }

    const response: typeof GetClanByIdResponse.Type = {
      data: clanData,
      meta: {
        updated_at: clanStats.updatedAt,
      },
    }

    return response
  }).pipe(
    Effect.tapError(Effect.logError),
    Effect.catchTags({
      BrawlhallaClanNotFound: () => Effect.fail(new NotFound()),
      BrawlhallaRateLimitError: () => Effect.fail(new TooManyRequests()),
      BrawlhallaApiError: () => Effect.fail(new InternalServerError()),
    }),
    Effect.withSpan("get-clan-by-id"),
  )
