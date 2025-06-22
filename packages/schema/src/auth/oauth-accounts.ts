import { relations } from "drizzle-orm"
import { sqliteTable, text } from "drizzle-orm/sqlite-core"
import { createSelectSchema } from "drizzle-zod"
import { withExpiry, withTimestamp } from "../helpers/with-timestamp"
import { usersTable } from "./users"

export const DISCORD_PROVIDER_ID = "discord"
export const GOOGLE_PROVIDER_ID = "google"

const providers = [DISCORD_PROVIDER_ID, GOOGLE_PROVIDER_ID] as const
export type Provider = (typeof providers)[number]

export const oauthAccountsTable = sqliteTable("oauth_accounts", {
	id: text("id").primaryKey().notNull(),
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

export const oauthAccountSelectSchema = createSelectSchema(oauthAccountsTable)

export const oauthAccountsRelations = relations(
	oauthAccountsTable,
	({ one }) => ({
		user: one(usersTable, {
			fields: [oauthAccountsTable.userId],
			references: [usersTable.id],
		}),
	}),
)
