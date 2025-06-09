import type { InferSelectModel } from 'drizzle-orm';
import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

import { usersTable } from '../auth/users';
import { legendsMap } from '@dair/brawlhalla-api/src/constants/legends';

const pageTypes = ['player_stats', 'clan_stats'] as const;

export const pageTypeSchema = z.enum(pageTypes);
export const pageTypeEnum = (name: string) => text(name, { enum: pageTypes });

// TODO: add union if more than one meta schema is allowed
// const metaSchema = z.union([playerStatsMetaSchema]).nullable()
const metaV1Schema = z
  .object({
    version: z.literal('1'),
    data: z.object({
      icon: z
        .union([
          z.object({
            type: z.literal('legend'),
            id: z.number().optional(),
          }),
          z.object({
            type: z.literal('url'),
            url: z.string(),
          }),
        ])
        .nullable(),
    }),
  })
  .nullable();

const metaSchema = metaV1Schema;

type Meta = z.infer<typeof metaSchema>;

export const bookmarksTable = sqliteTable(
  'bookmarks',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    pageType: pageTypeEnum('page_type').notNull(),
    pageId: text('page_id').notNull(),
    name: text('name').notNull(),
    meta: text('meta', { mode: 'json' }).$type<Meta>(),
    userId: text('user_id')
      .notNull()
      .references(() => usersTable.id),
    createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('unique_bookmark').on(table.userId, table.pageType, table.pageId),
  ]
);

export type Bookmark = InferSelectModel<typeof bookmarksTable>;

export const bookmarksInsertSchema = createInsertSchema(bookmarksTable, {
  pageType: pageTypeSchema,
  meta: metaSchema,
  userId: z.string().optional(),
});

export type NewBookmark = z.infer<typeof bookmarksInsertSchema>;
