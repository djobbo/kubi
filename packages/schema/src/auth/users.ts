import { sql, type InferSelectModel } from 'drizzle-orm';
import { text, integer, sqliteTable } from 'drizzle-orm/sqlite-core';

export const usersTable = sqliteTable('user', {
  id: text('id').primaryKey(),
  name: text('name'),
  firstName: text('first_name'),
  lastName: text('last_name'),
  avatarUrl: text('avatar_url'),
  email: text('email'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().default(sql`(unixepoch() * 1000)`),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull().default(sql`(unixepoch() * 1000)`),
});

export type User = InferSelectModel<typeof usersTable>;
