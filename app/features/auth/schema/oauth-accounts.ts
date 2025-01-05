import { primaryKey, text } from "drizzle-orm/pg-core"

import { authSchema } from "@/features/auth/schema/schema"
import { usersTable } from "@/features/auth/schema/users"

export const DISCORD_PROVIDER_ID = "discord"

export const providersEnum = authSchema.enum("oauth_provider", [
  DISCORD_PROVIDER_ID,
])

export const oauthAccountsTable = authSchema.table(
  "oauth_account",
  {
    providerId: providersEnum("provider_id"),
    providerUserId: text("provider_user_id"),
    userId: text("user_id")
      .notNull()
      .references(() => usersTable.id),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.providerId, table.providerUserId],
    }),
  }),
)
