import { Effect } from "effect"
import { Archive } from "@/services/archive"
import type { SearchGuildResponse } from "@dair/api-contract/src/routes/v1/brawlhalla/search-guild"

export const searchGuild = Effect.fn("searchGuild")(function* ({
  page = 1,
  limit = 50,
  name,
}: {
  page?: number
  limit?: number
  name?: string | undefined
}) {
  const archive = yield* Archive
  yield* Effect.log(`Searching for guilds: ${name ?? "all"}, page: ${page}`)
  const searchResult = yield* archive.searchGuilds({
    page,
    limit,
    name: name ?? undefined,
  })

  const response: typeof SearchGuildResponse.Type = {
    data: searchResult.clans.map((clan) => ({
      id: clan.clanId,
      name: clan.name ?? "",
      xp: clan.xp ?? 0,
      membersCount: clan.membersCount ?? 0,
      createdDate: clan.createdDate,
      recordedAt: clan.recordedAt,
    })),
    meta: {
      page: searchResult.page,
      limit: searchResult.limit,
      hasMore: searchResult.clans.length === limit,
      total: searchResult.total,
      query: searchResult.name ?? null,
      timestamp: new Date(),
    },
  }

  return response
})
