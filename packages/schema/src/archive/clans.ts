import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { createInsertSchema } from 'drizzle-zod';

export const clansTable = sqliteTable('clans', {
  id: text('clan_id').notNull().primaryKey(),
  name: text('name').notNull(),
  createdAt: integer('createdAt', { mode: 'timestamp_ms' }),
  updatedAt: integer('updatedAt', { mode: 'timestamp_ms' }).notNull().default(sql`(unixepoch() * 1000)`),
  xp: integer('xp').notNull().default(0),
});

export type ArchivedClan = typeof clansTable.$inferSelect;
export type NewArchivedClan = typeof clansTable.$inferInsert;

export const clanInsertSchema = createInsertSchema(clansTable);
