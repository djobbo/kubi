import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { CACHE_VERSION } from './constants';

export const apiCacheTable = sqliteTable('api-cache', {
  cacheName: text('cacheName').notNull(),
  cacheId: text('cacheId').primaryKey(),
  data: text('data', { mode: 'json' }),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().defaultNow(),
  version: integer('version').default(CACHE_VERSION).notNull(),
});
