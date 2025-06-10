import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";
import { usersTable } from "./users";


export const DISCORD_PROVIDER_ID = 'discord';
export const GOOGLE_PROVIDER_ID = 'google';

const providers = [DISCORD_PROVIDER_ID, GOOGLE_PROVIDER_ID] as const;
export type Provider = (typeof providers)[number];

export const oauthAccountsTable = sqliteTable("oauth_accounts", {
  id: text("id").primaryKey().notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  provider: text({ enum: providers }).notNull(),
  providerUserId: text("provider_user_id").notNull(),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token"),
  expiresAt: integer("expires_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

export type OAuthAccount = typeof oauthAccountsTable.$inferSelect;
export type NewOAuthAccount = typeof oauthAccountsTable.$inferInsert;

export const oauthAccountsRelations = relations(oauthAccountsTable, ({ one }) => ({
	user: one(usersTable, {
		fields: [oauthAccountsTable.userId],
		references: [usersTable.id],
	}),
}));
