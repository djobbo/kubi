import type { InferSelectModel } from 'drizzle-orm';
import { text, integer, sqliteTable } from 'drizzle-orm/sqlite-core';

import { usersTable } from './users';

export const sessionsTable = sqliteTable('session', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => usersTable.id),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
});

export type Session = InferSelectModel<typeof sessionsTable>;
