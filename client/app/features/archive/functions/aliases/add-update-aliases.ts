import { createServerFn } from '@tanstack/react-start';
import { sql } from 'drizzle-orm';
import { z } from 'zod';

import { db } from '@/db';
import { serviceAuthenticationMiddleware } from '@/features/auth/functions/serviceAuthenticationMiddleware';
import { cleanString } from '@dair/common/src/helpers/cleanString';

import type { NewAlias } from '../../schema';
import { aliasesInsertSchema, aliasesTable } from '../../schema';

export const dedupeAndCleanAliases = (aliases: NewAlias[]) =>
  aliases.reduce((acc, alias) => {
    let cleanAlias = cleanString(alias.alias.trim());

    // Strip the •2 suffix from the alias (suffix added when 2 players play on the same machine)
    if (cleanAlias.endsWith('•2')) {
      cleanAlias = cleanAlias.slice(0, -2);
    }

    if (cleanAlias.length < 1) {
      return acc;
    }

    if (acc.some((existingAlias) => existingAlias.alias === cleanAlias)) {
      return acc;
    }

    acc.push(alias);
    return acc;
  }, [] as NewAlias[]);

export const addOrUpdateAliases = createServerFn({ method: 'POST' })
  .middleware([serviceAuthenticationMiddleware])
  .validator(z.object({ aliases: z.array(aliasesInsertSchema) }))
  .handler(async ({ data: { aliases } }) => {
    const dedupedAliases = dedupeAndCleanAliases(aliases);

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
      .execute();

    return aliasesData ?? aliases;
  });
