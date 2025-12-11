import { relations } from "drizzle-orm"
import { pgTable, serial, text } from "drizzle-orm/pg-core"
import { withExpiry, withTimestamp } from "../../helpers/with-timestamp"
import { usersTable } from "./users"

export const DISCORD_PROVIDER_ID = "discord"
export const GOOGLE_PROVIDER_ID = "google"

export const providers = [DISCORD_PROVIDER_ID, GOOGLE_PROVIDER_ID] as const
export type Provider = (typeof providers)[number]

export const oauthAccountsTable = pgTable("oauth_accounts", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  provider: text({ enum: providers }).notNull(),
  providerUserId: text("provider_user_id").notNull(),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token"),
  ...withTimestamp,
  ...withExpiry,
})

export type OAuthAccount = typeof oauthAccountsTable.$inferSelect
export type NewOAuthAccount = typeof oauthAccountsTable.$inferInsert

export const oauthAccountsRelations = relations(
  oauthAccountsTable,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [oauthAccountsTable.userId],
      references: [usersTable.id],
    }),
  }),
)
