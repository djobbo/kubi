import { BrawlhallaApi } from "@/services/brawlhalla-api"
import type {
  Clan,
  GetClanByIdResponse,
} from "@dair/api-contract/src/routes/v1/brawlhalla/get-guild-by-id"
import { Effect } from "effect"
import { getGuildLevel } from "@dair/brawlhalla-api"

export const getGuildById = (clanId: number) =>
  Effect.gen(function* () {
    // TODO: const session = yield* Authorization.getSession();

    const brawlhallaApi = yield* BrawlhallaApi
    const clanStats = yield* brawlhallaApi.getClanById(clanId)

    const clanXp = Number(clanStats.data.clan_xp)
    const { level, xpPercentage } = getGuildLevel(clanXp)

    const clanData: typeof Clan.Type = {
      id: clanStats.data.clan_id,
      name: clanStats.data.clan_name,
      created_at: clanStats.data.clan_create_date,
      xp: clanXp,
      xp_percentage: xpPercentage,
      level: level,
      lifetime_xp: clanStats.data.clan_lifetime_xp ?? 0,
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
  })
