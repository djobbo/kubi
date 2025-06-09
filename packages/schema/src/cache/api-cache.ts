import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const apiCacheTable = sqliteTable('api-cache', {
  cacheName: text('cacheName').notNull(),
  cacheId: text('cacheId').primaryKey(),
  data: text('data', { mode: 'json' }),
  createdAt: integer('createdAt', { mode: 'timestamp_ms' }).notNull().defaultNow(),
  version: integer('version').notNull(),
});
