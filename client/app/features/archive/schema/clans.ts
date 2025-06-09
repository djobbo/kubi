import type { InferSelectModel } from 'drizzle-orm';
import { integer, text, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import type { z } from 'zod';

import { archiveSchema } from './schema';

export const clansTable = archiveSchema.table('clans', {
  id: text('clan_id').notNull().primaryKey(),
  name: text('name').notNull(),
  createdAt: timestamp('createdAt'),
  updatedAt: timestamp('updatedAt'),
  xp: integer('xp').notNull().default(0),
});

export type ArchivedClan = InferSelectModel<typeof clansTable>;

export const clanInsertSchema = createInsertSchema(clansTable);

export type NewArchivedClan = z.infer<typeof clanInsertSchema>;
