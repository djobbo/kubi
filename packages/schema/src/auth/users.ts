import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";
import { bookmarksTable } from '../bookmarks/bookmarks';
import { oauthAccountsTable } from './oauth-accounts';
import { sessionsTable } from './sessions';

export const usersTable = sqliteTable("users", {
  id: text("id").primaryKey().notNull(),
  email: text("email").unique().notNull(),
  username: text("username").notNull(),
  avatarUrl: text("avatar_url"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

export type User = typeof usersTable.$inferSelect;
export type NewUser = typeof usersTable.$inferInsert;

export const usersRelations = relations(usersTable, ({ many }) => ({
	oauthAccounts: many(oauthAccountsTable),
	bookmarks: many(bookmarksTable),
  sessions: many(sessionsTable),
}));