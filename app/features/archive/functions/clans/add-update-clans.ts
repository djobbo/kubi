import { createServerFn } from "@tanstack/start"
import { sql } from "drizzle-orm"
import { z } from "zod"

import { db } from "@/db"
import { serviceAuthenticationMiddleware } from "@/features/auth/functions/serviceAuthenticationMiddleware"
import { cleanString } from "@/helpers/cleanString"

import { clanInsertSchema, clansTable } from "../../schema"

export const addOrUpdateClans = createServerFn({ method: "POST" })
  .middleware([serviceAuthenticationMiddleware])
  .validator(z.object({ clans: z.array(clanInsertSchema) }))
  .handler(async ({ data: { clans } }) => {
    const clansData = await db
      .insert(clansTable)
      .values(
        clans.map((clan) => ({
          ...clan,
          name: cleanString(clan.name.trim()),
          createdAt: clan.createdAt ?? null,
        })),
      )
      .returning()
      .onConflictDoUpdate({
        set: {
          createdAt: sql`CASE WHEN excluded."createdAt" IS NOT NULL THEN excluded."createdAt" ELSE ${clansTable.createdAt} END`,
          xp: sql`excluded.xp`,
          name: sql`excluded.name`,
          updatedAt: new Date(),
        },
        target: [clansTable.id],
      })
      .execute()

    return clansData
  })
