import { Effect } from "effect";
import { brawlhallaApi } from "../../../services/brawlhalla-api";
import type { Clan, GetClanByIdResponse } from "./schema";
import {
  InternalServerError,
  NotFound,
  ServiceUnavailable,
} from "@effect/platform/HttpApiError";

export const getClanById = (clanId: number) =>
  Effect.gen(function* () {
    // TODO: const session = yield* Authorization.getSession();

    const [clanStats] = yield* Effect.all([brawlhallaApi.getClanById(clanId)], {
      concurrency: 1,
    });

    const clanData: typeof Clan.Type = {
      id: clanStats.data.clan_id,
      name: clanStats.data.clan_name,
      created_at: clanStats.data.clan_create_date,
      xp: clanStats.data.clan_xp,
      members: clanStats.data.clan.map(member => ({
        id: member.brawlhalla_id,
        name: member.name,
        rank: member.rank,
        joined_at: member.join_date,
        xp: member.xp,
      })),
      bookmark: null,
    };

    const response: typeof GetClanByIdResponse.Type = {
      data: clanData,
      meta: {
        updated_at: clanStats.updatedAt,
      },
    };

    return response;
  }).pipe(
    Effect.catchTags({
      ResponseError: Effect.fn(function* (error) {
        switch (error.response.status) {
          case 404:
            return yield* Effect.fail(new NotFound());
          case 429:
            return yield* Effect.fail(new ServiceUnavailable());
          default:
            return yield* Effect.fail(new InternalServerError());
        }
      }),
      DBError: () => Effect.fail(new InternalServerError()),
      ParseError: () => Effect.fail(new InternalServerError()),
      RequestError: () => Effect.fail(new InternalServerError()),
      TimeoutException: () => Effect.fail(new InternalServerError()),
      ConfigError: Effect.die,
    })
  );
