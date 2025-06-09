import { sql, type InferSelectModel } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { createInsertSchema } from 'drizzle-zod';
import type { z } from 'zod';

export const clansTable = sqliteTable('clans', {
  id: text('clan_id').notNull().primaryKey(),
  name: text('name').notNull(),
  createdAt: integer('createdAt', { mode: 'timestamp_ms' }).notNull().default(sql`(unixepoch() * 1000)`),
  updatedAt: integer('updatedAt', { mode: 'timestamp_ms' }).notNull().default(sql`(unixepoch() * 1000)`),
  xp: integer('xp').notNull().default(0),
});

export type ArchivedClan = InferSelectModel<typeof clansTable>;

export const clanInsertSchema = createInsertSchema(clansTable);

export type NewArchivedClan = z.infer<typeof clanInsertSchema>;
