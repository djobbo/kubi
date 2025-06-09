import { createServerFn } from '@tanstack/react-start';
import { sql } from 'drizzle-orm';
import { z } from 'zod';

import { db } from '@dair/db';
import { serviceAuthenticationMiddleware } from '@/features/auth/functions/serviceAuthenticationMiddleware';
import { cleanString } from '@dair/common/src/helpers/cleanString';

import { clanInsertSchema, clansTable } from '../../../../../../db/src/schema/archive/clans';

export const addOrUpdateClans = createServerFn({ method: 'POST' })
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
        }))
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
      .execute();

    return clansData;
  });
