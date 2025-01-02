import { createServerFn } from "@tanstack/start"
import { z } from "zod"

import { env } from "@/env"
import { withCache } from "@/features/cache/cache"

import { rankedRegionSchema } from "../constants/ranked/regions"
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
    return withCache(
      `player-stats-${playerId}`,
      () =>
        getBhApi(
          `/player/${playerId}/stats`,
          playerStatsSchema,
          playerStatsMock,
        ),
      env.IS_DEV ? 30 * 1000 : 15 * 60 * 1000,
    )
  })

export const getPlayerRanked = createServerFn({ method: "GET" })
  .validator(brawlhallaIdSchema)
  .handler(async ({ data: playerId }) => {
    return withCache(
      `player-ranked-${playerId}`,
      () =>
        getBhApi(
          `/player/${playerId}/ranked`,
          playerRankedSchema,
          playerRankedMock,
        ) as unknown as Promise<PlayerRanked>, // TODO: Zod issue, it can't infer the type correctly
      env.IS_DEV ? 30 * 1000 : 15 * 60 * 1000,
    )
  })

export const getClan = createServerFn({ method: "GET" })
  .validator(brawlhallaIdSchema)
  .handler(async ({ data: clanId }) => {
    return withCache(
      `clan-stats-${clanId}`,
      () => getBhApi(`/clan/${clanId}`, clanSchema, clanMock),
      env.IS_DEV ? 30 * 1000 : 15 * 60 * 1000,
    )
  })

export const get1v1Rankings = createServerFn({ method: "GET" })
  .validator(
    z.object({
      region: rankedRegionSchema,
      page: z.number().optional(),
      name: z.string().optional(),
    }),
  )
  .handler(async ({ data: query }) => {
    const { region = "all", page = 1, name } = query

    return withCache(
      `ranked-1v1-${region}-${page}-${name}`,
      () =>
        getBhApi(
          `/rankings/1v1/${region.toLowerCase()}/${page}${name ? `?name=${name}` : ""}`,
          z.array(ranking1v1Schema),
          rankings1v1Mock,
        ) as unknown as Promise<Ranking1v1[]>, // TODO: Zod issue, it can't infer the type correctly
      env.IS_DEV ? 30 * 1000 : 5 * 60 * 1000,
    )
  })

export const get2v2Rankings = createServerFn({ method: "GET" })
  .validator(
    z.object({
      region: rankedRegionSchema,
      page: z.number().optional(),
    }),
  )
  .handler(async ({ data: query }) => {
    const { region = "all", page = 1 } = query

    return withCache(
      `ranked-2v2-${region}-${page}`,
      () =>
        getBhApi(
          `/rankings/2v2/${region.toLowerCase()}/${page}`,
          z.array(ranking2v2Schema),
          rankings2v2Mock,
        ),
      env.IS_DEV ? 30 * 1000 : 5 * 60 * 1000,
    ) as unknown as Promise<Ranking2v2[]> // TODO: Zod issue, it can't infer the type correctly
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

    // TODO: search aliases in db
    const aliases = []

    const isPotentialBrawlhallaId = z
      .string()
      .regex(/^[0-9]+$/)
      .safeParse(name).success

    // TODO: search aliases in db
    const potentialBrawlhallaIdPlayer = isPotentialBrawlhallaId ? null : null

    return {
      rankings,
      aliases,
      potentialBrawlhallaIdPlayer,
    }
  })
