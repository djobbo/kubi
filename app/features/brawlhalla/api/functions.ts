import { createServerFn } from "@tanstack/start"
import type { z } from "zod"

import { env } from "@/env"
import { withCache } from "@/features/cache/cache"

import { clanMock } from "./mocks/clan"
import { playerRankedMock } from "./mocks/player-ranked"
import { playerStatsMock } from "./mocks/player-stats"
import { brawlhallaIdSchema } from "./schema/brawlhalla-id"
import { clanSchema } from "./schema/clan"
import { playerRankedSchema } from "./schema/player-ranked"
import { playerStatsSchema } from "./schema/player-stats"

const __DEV = process.env.NODE_ENV === "development"

const BH_API_BASE = "https://api.brawlhalla.com"

const getBhApi = async <T>(
  path: string,
  schema: z.ZodType<T>,
  mock?: T,
): Promise<T> => {
  const url = new URL(path, BH_API_BASE)

  url.searchParams.append("api_key", env.BRAWLHALLA_API_KEY)

  if (__DEV && mock) return mock

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
      15 * 60 * 1000,
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
        ),
      15 * 60 * 1000,
    )
  })

export const getClan = createServerFn({ method: "GET" })
  .validator(brawlhallaIdSchema)
  .handler(async ({ data: clanId }) => {
    return withCache(
      `clan-stats-${clanId}`,
      () => getBhApi(`/clan/${clanId}`, clanSchema, clanMock),
      15 * 60 * 1000,
    )
  })
