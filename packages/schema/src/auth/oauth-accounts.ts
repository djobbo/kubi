import type { InferSelectModel } from 'drizzle-orm';

import { usersTable } from './users';
import { primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const DISCORD_PROVIDER_ID = 'discord';

const providers = [DISCORD_PROVIDER_ID] as const;

export const oauthAccountsTable = sqliteTable(
  'oauth_account',
  {
    providerId: text({ enum: providers }).notNull(),
    providerUserId: text('provider_user_id'),
    userId: text('user_id')
      .notNull()
      .references(() => usersTable.id),
  },
  (table) => [
    primaryKey({
      columns: [table.providerId, table.providerUserId],
    }),
  ]
);

export type OAuthAccount = InferSelectModel<typeof oauthAccountsTable>;
