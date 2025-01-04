import { createServerFn } from "@tanstack/start"
import { sql } from "drizzle-orm"
import { z } from "zod"

import { db } from "@/db"
import { serviceAuthenticationMiddleware } from "@/features/auth/functions/serviceAuthenticationMiddleware"
import { cleanString } from "@/helpers/cleanString"

import type { NewAlias } from "../schema"
import { aliasesInsertSchema, aliasesTable } from "../schema"

export const dedupeAliases = (aliases: NewAlias[]) =>
  aliases.reduce((acc, alias) => {
    const cleanAlias = cleanString(alias.alias.trim())
    if (cleanAlias.length < 1) {
      return acc
    }

    if (acc.some((existingAlias) => existingAlias.alias === cleanAlias)) {
      return acc
    }

    acc.push(alias)
    return acc
  }, [] as NewAlias[])

export const addOrUpdateAliases = createServerFn({ method: "POST" })
  .middleware([serviceAuthenticationMiddleware])
  .validator(z.object({ aliases: z.array(aliasesInsertSchema) }))
  .handler(async ({ data: { aliases } }) => {
    const dedupedAliases = dedupeAliases(aliases)

    console.log("dedupedAliases", dedupedAliases)

    const aliasesData = await db
      .insert(aliasesTable)
      .values(dedupedAliases)
      .returning()
      .onConflictDoUpdate({
        set: {
          public: sql`excluded.public`,
          updatedAt: new Date(),
        },
        target: [aliasesTable.playerId, aliasesTable.alias],
      })
      .execute()

    return aliasesData ?? aliases
  })
