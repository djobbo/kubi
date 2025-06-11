import { relations } from "drizzle-orm"
import { sqliteTable, text } from "drizzle-orm/sqlite-core"
import { bookmarksTable } from "../bookmarks/bookmarks"
import { oauthAccountsTable } from "./oauth-accounts"
import { sessionsTable } from "./sessions"
import { withTimestamp } from '../helpers/with-timestamp'

export const usersTable = sqliteTable("users", {
	id: text("id").primaryKey().notNull(),
	email: text("email").unique().notNull(),
	username: text("username").notNull(),
	avatarUrl: text("avatar_url"),
	...withTimestamp,
})

export type User = typeof usersTable.$inferSelect
export type NewUser = typeof usersTable.$inferInsert

export const usersRelations = relations(usersTable, ({ many }) => ({
	oauthAccounts: many(oauthAccountsTable),
	bookmarks: many(bookmarksTable),
	sessions: many(sessionsTable),
}))
