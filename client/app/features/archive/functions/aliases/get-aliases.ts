import { createServerFn } from '@tanstack/react-start';
import { and, desc, eq } from 'drizzle-orm';
import { z } from 'zod';

import { db } from '@/db';

import { aliasesTable } from '../../schema/aliases';

const aliasesQuerySchema = z.object({
  playerId: z.string(),
  page: z.number().optional(),
  limit: z.number().optional(),
});

export type AliasesQuery = z.infer<typeof aliasesQuerySchema>;

export const getAliases = createServerFn({ method: 'GET' })
  .validator(
    z.object({
      query: aliasesQuerySchema,
    })
  )
  .handler(async ({ data: { query } }) => {
    const { page = 1, limit = 10, playerId } = query;

    const aliases = await db
      .select()
      .from(aliasesTable)
      .orderBy(desc(aliasesTable.createdAt))
      .where(and(eq(aliasesTable.playerId, playerId), eq(aliasesTable.public, true)))
      .limit(limit)
      .offset((page - 1) * limit)
      .execute();

    return aliases;
  });
