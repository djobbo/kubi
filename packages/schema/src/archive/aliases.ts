import { sql, type InferSelectModel } from 'drizzle-orm';
import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { createInsertSchema } from 'drizzle-zod';
import type { z } from 'zod';

export const aliasesTable = sqliteTable(
  'aliases',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    alias: text('alias').notNull(),
    playerId: text('player_id').notNull(),
    createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
    public: integer('public', { mode: 'boolean' }).notNull().default(true),
  },
  (table) => [
    uniqueIndex('unique_alias').on(table.playerId, table.alias),
  ]
);

export type Alias = InferSelectModel<typeof aliasesTable>;

export const aliasesInsertSchema = createInsertSchema(aliasesTable);

export type NewAlias = z.infer<typeof aliasesInsertSchema>;
