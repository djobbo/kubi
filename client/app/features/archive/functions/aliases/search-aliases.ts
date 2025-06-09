import { createServerFn } from '@tanstack/react-start';
import { and, desc, eq, ilike, inArray } from 'drizzle-orm';
import { z } from 'zod';

import { db } from '@dair/api';

import { aliasesTable } from '@dair/schema/src/archive/aliases';

const aliasesQuerySchema = z.object({
  player: z.string(),
  page: z.number().optional(),
  limit: z.number().optional(),
});

const MIN_ALIAS_SEARCH_LENGTH = 1;

export type AliasesQuery = z.infer<typeof aliasesQuerySchema>;

export const searchAliases = createServerFn({ method: 'GET' })
  .validator(
    z.object({
      query: aliasesQuerySchema,
    })
  )
  .handler(async ({ data: { query } }) => {
    const { page = 1, limit = 10, player } = query;

    if (!player || player.length < MIN_ALIAS_SEARCH_LENGTH) {
      return [];
    }

    const aliases = await db
      .select()
      .from(aliasesTable)
      .orderBy(desc(aliasesTable.createdAt))
      .where(and(eq(aliasesTable.public, true), ilike(aliasesTable.alias, `${player}%`)))
      .limit(limit)
      .offset((page - 1) * limit)
      .execute();

    const allAliases = await db
      .select()
      .from(aliasesTable)
      .where(
        inArray(
          aliasesTable.playerId,
          aliases.map((alias) => alias.playerId)
        )
      )
      .execute();

    const players = aliases.map((alias) => {
      const otherAliases = allAliases
        .filter((a) => a.playerId === alias.playerId)
        .map((a) => a.alias);

      return {
        ...alias,
        otherAliases,
      };
    });

    return players;
  });
