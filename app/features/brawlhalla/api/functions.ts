import { createServerFn } from "@tanstack/start"
import { z } from "zod"

import { env } from "@/env"
import { addOrUpdateAliases } from "@/features/archive/functions/aliases/add-update-aliases"
import { getAliases } from "@/features/archive/functions/aliases/get-aliases"
import { searchAliases } from "@/features/archive/functions/aliases/search-aliases"
import { addOrUpdateClans } from "@/features/archive/functions/clans/add-update-clans"
import { withCache } from "@/features/cache/cache"
import { cleanString } from "@/helpers/cleanString"
import { formatUnixTime, getDateFromUnixTime } from "@/helpers/date"

import { MAX_SHOWN_ALIASES } from "../constants/aliases"
import { rankedRegionSchema } from "../constants/ranked/regions"
import { getTeamPlayers } from "../helpers/teamPlayers"
import { clanMock } from "./mocks/clan"
import { playerRankedMock } from "./mocks/player-ranked"
import { playerStatsMock } from "./mocks/player-stats"
import { rankings1v1Mock } from "./mocks/rankings-1v1"
import { rankings2v2Mock } from "./mocks/rankings-2v2"
import { brawlhallaIdSchema } from "./schema/brawlhalla-id"
import { clanSchema } from "./schema/clan"
import type { PlayerRanked } from "./schema/player-ranked"
import { playerRankedSchema } from "./schema/player-ranked"
import { playerStatsSchema } from "./schema/player-stats"
import type { Ranking1v1, Ranking2v2 } from "./schema/rankings"
import { ranking1v1Schema, ranking2v2Schema } from "./schema/rankings"

const BH_API_BASE = "https://api.brawlhalla.com"

const getBhApi = async <T>(
  path: string,
  schema: z.ZodType<T>,
  mock?: T,
): Promise<T> => {
  const url = new URL(path, BH_API_BASE)

  url.searchParams.append("api_key", env.BRAWLHALLA_API_KEY)

  if (env.IS_DEV && mock) return mock

  const response = await fetch(url)

  if (!response.ok) {
    console.error("Brawlhalla API - Fetch Error", {
      status: response.status,
      path,
    })

    throw new Error(`Failed to fetch Brawlhalla API: ${response.statusText}`)
  }

  const json = await response.json()

  const safeParseResult = schema.safeParse(json)

  if (!safeParseResult.success) {
    console.error("Brawlhalla API - Parse Error", {
      path,
      error: safeParseResult.error,
    })
  }

  // Even if the parse fails, we still want to return the JSON,
  // the parsing is here to log undocumented API changes
  return json as T
}

export const getPlayerStats = createServerFn({ method: "GET" })
  .validator(brawlhallaIdSchema)
  .handler(async ({ data: playerId }) => {
    const playerStats = await withCache(
      `player-stats-${playerId}`,
      () =>
        getBhApi(
          `/player/${playerId}/stats`,
          playerStatsSchema,
          playerStatsMock,
        ),
      env.IS_DEV ? 30 * 1000 : 15 * 60 * 1000,
    )

    try {
      const updateAliasesQuery = addOrUpdateAliases({
        data: {
          serviceApiKey: env.SERVICE_API_KEY,
          aliases: [
            {
              playerId: playerId.toString(),
              alias: playerStats.name,
            },
          ],
        },
      })

      const updateClansQuery = playerStats.clan
        ? addOrUpdateClans({
            data: {
              serviceApiKey: env.SERVICE_API_KEY,
              clans: [
                {
                  id: playerStats.clan.clan_id.toString(),
                  name: cleanString(playerStats.clan.clan_name.trim()),
                  xp: z.coerce
                    .number()
                    .catch(0)
                    .parse(playerStats.clan.clan_xp),
                },
              ],
            },
          })
        : null

      await Promise.all([updateAliasesQuery, updateClansQuery])
    } catch (e) {
      console.error("Failed to add alias - playerStats", e)
    }

    return playerStats
  })

export const getPlayerRanked = createServerFn({ method: "GET" })
  .validator(brawlhallaIdSchema)
  .handler(async ({ data: playerId }) => {
    const playerRanked = await withCache(
      `player-ranked-${playerId}`,
      () =>
        getBhApi(
          `/player/${playerId}/ranked`,
          playerRankedSchema,
          playerRankedMock,
        ) as unknown as Promise<PlayerRanked>, // TODO: Zod issue, it can't infer the type correctly
      env.IS_DEV ? 30 * 1000 : 15 * 60 * 1000,
    )

    try {
      await addOrUpdateAliases({
        data: {
          serviceApiKey: env.SERVICE_API_KEY,
          aliases: [
            {
              playerId: playerId.toString(),
              alias: playerRanked.name,
            },
            ...playerRanked["2v2"]
              .map((team) => {
                const players = getTeamPlayers(team)
                if (!players) return null
                const [player1, player2] = players

                return [
                  {
                    playerId: player1.id.toString(),
                    alias: player1.name,
                  },
                  {
                    playerId: player2.id.toString(),
                    alias: player2.name,
                  },
                ]
              })
              .flat()
              .filter((player) => player !== null),
          ],
        },
      })
    } catch (e) {
      console.error("Failed to add aliases - playerRanked", e)
    }

    return playerRanked
  })

export const getClan = createServerFn({ method: "GET" })
  .validator(brawlhallaIdSchema)
  .handler(async ({ data: clanId }) => {
    const clan = await withCache(
      `clan-stats-${clanId}`,
      () => getBhApi(`/clan/${clanId}`, clanSchema, clanMock),
      env.IS_DEV ? 30 * 1000 : 15 * 60 * 1000,
    )

    try {
      const updateAliasesQuery = addOrUpdateAliases({
        data: {
          serviceApiKey: env.SERVICE_API_KEY,
          aliases: clan.clan.map((player) => {
            return {
              playerId: player.brawlhalla_id.toString(),
              alias: player.name,
            }
          }),
        },
      })

      const updateClansQuery = addOrUpdateClans({
        data: {
          serviceApiKey: env.SERVICE_API_KEY,
          clans: [
            {
              id: clan.clan_id.toString(),
              name: clan.clan_name,
              xp: z.coerce.number().catch(0).parse(clan.clan_xp),
              createdAt: getDateFromUnixTime(clan.clan_create_date),
            },
          ],
        },
      })

      await Promise.all([updateAliasesQuery, updateClansQuery])
    } catch (e) {
      console.error("Failed to update aliases or clans - clan", e)
    }

    return clan
  })

export const get1v1Rankings = createServerFn({ method: "GET" })
  .validator(
    z.object({
      region: rankedRegionSchema,
      page: z.number().min(0).max(1000).optional().catch(1),
      name: z.string().optional(),
    }),
  )
  .handler(async ({ data: query }) => {
    const { region = "all", page = 1, name } = query

    const rankings = await withCache(
      `ranked-1v1-${region}-${page}-${name}`,
      () =>
        getBhApi(
          `/rankings/1v1/${region.toLowerCase()}/${page}${name ? `?name=${name}` : ""}`,
          z.array(ranking1v1Schema),
          rankings1v1Mock,
        ) as unknown as Promise<Ranking1v1[]>, // TODO: Zod issue, it can't infer the type correctly
      env.IS_DEV ? 30 * 1000 : 5 * 60 * 1000,
    )

    try {
      await addOrUpdateAliases({
        data: {
          serviceApiKey: env.SERVICE_API_KEY,
          aliases: rankings.map((ranking) => ({
            playerId: ranking.brawlhalla_id.toString(),
            alias: ranking.name,
          })),
        },
      })
    } catch (e) {
      console.error("Failed to add aliases - 1v1 rankings", e)
    }

    return rankings
  })

export const get2v2Rankings = createServerFn({ method: "GET" })
  .validator(
    z.object({
      region: rankedRegionSchema,
      page: z.number().min(0).max(1000).optional().catch(1),
    }),
  )
  .handler(async ({ data: query }) => {
    const { region = "all", page = 1 } = query

    const rankings = await withCache(
      `ranked-2v2-${region}-${page}`,
      () =>
        getBhApi(
          `/rankings/2v2/${region.toLowerCase()}/${page}`,
          z.array(ranking2v2Schema),
          rankings2v2Mock,
        ) as unknown as Promise<Ranking2v2[]>, // TODO: Zod issue, it can't infer the type correctly
      env.IS_DEV ? 30 * 1000 : 5 * 60 * 1000,
    )

    try {
      await addOrUpdateAliases({
        data: {
          serviceApiKey: env.SERVICE_API_KEY,
          aliases: rankings
            .map((ranking) => {
              const players = getTeamPlayers(ranking)
              if (!players) return null
              const [player1, player2] = players

              return [
                {
                  playerId: player1.id.toString(),
                  alias: player1.name,
                },
                {
                  playerId: player2.id.toString(),
                  alias: player2.name,
                },
              ]
            })
            .flat()
            .filter((player) => player !== null),
        },
      })
    } catch (e) {
      console.error("Failed to add aliases - 2v2 rankings", e)
    }

    return rankings
  })

export const searchPlayer = createServerFn({ method: "GET" })
  .validator(z.string())
  .handler(async ({ data: name }) => {
    if (!name)
      return {
        rankings: [],
        aliases: [],
        potentialBrawlhallaIdPlayer: null,
      }

    const rankings = await get1v1Rankings({
      data: { region: "all", page: 1, name },
    })

    const aliases = await searchAliases({
      data: { query: { player: name, limit: 5 } },
    })

    const isPotentialBrawlhallaId = z
      .string()
      .regex(/^[0-9]+$/)
      .safeParse(name).success

    const potentialBrawlhallaIdAliases = isPotentialBrawlhallaId
      ? await getAliases({
          data: {
            query: {
              playerId: name,
              limit: MAX_SHOWN_ALIASES,
            },
          },
        })
      : null

    return {
      rankings,
      aliases,
      potentialBrawlhallaIdAliases,
    }
  })
