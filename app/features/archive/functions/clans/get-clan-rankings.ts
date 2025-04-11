import { createServerFn } from "@tanstack/react-start"
import { desc, eq } from "drizzle-orm"
import { z } from "zod"

import { db } from "@/db"

import { clansTable } from "../../schema"

const clanRankingsQuerySchema = z.object({
  clan: z.string().optional(),
  page: z.number().optional(),
  limit: z.number().optional(),
})

export type ClanRankingsQuery = z.infer<typeof clanRankingsQuerySchema>

export const getClanRankings = createServerFn({ method: "GET" })
  .validator(
    z.object({
      query: clanRankingsQuerySchema,
    }),
  )
  .handler(async ({ data: { query } }) => {
    const { page = 1, limit = 10, clan } = query

    const clanRankingsQuery = db
      .select()
      .from(clansTable)
      .orderBy(desc(clansTable.xp))
      .limit(limit)
      .offset((page - 1) * limit)

    if (clan) {
      const rankings = await clanRankingsQuery
        .where(eq(clansTable.name, clan))
        .execute()

      return rankings
    }

    const rankings = clanRankingsQuery.execute()

    return rankings
  })
