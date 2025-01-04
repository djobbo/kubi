import { createServerFn } from "@tanstack/start"
import { and, desc, eq, ilike } from "drizzle-orm"
import { z } from "zod"

import { db } from "@/db"

import { aliasesTable } from "../schema/aliases"

const aliasesQuerySchema = z.object({
  player: z.string(),
  page: z.number().optional(),
  limit: z.number().optional(),
})

const MIN_ALIAS_SEARCH_LENGTH = 1

export type AliasesQuery = z.infer<typeof aliasesQuerySchema>

export const searchAliases = createServerFn({ method: "GET" })
  .validator(
    z.object({
      query: aliasesQuerySchema,
    }),
  )
  .handler(async ({ data: { query } }) => {
    const { page = 1, limit = 10, player } = query

    if (!player || player.length < MIN_ALIAS_SEARCH_LENGTH) {
      return []
    }

    const aliases = await db
      .select()
      .from(aliasesTable)
      .orderBy(desc(aliasesTable.createdAt))
      .where(
        and(
          eq(aliasesTable.public, true),
          ilike(aliasesTable.alias, `${player}%`),
        ),
      )
      .limit(limit)
      .offset((page - 1) * limit)
      .execute()

    return aliases
  })
