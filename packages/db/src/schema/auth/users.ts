import { relations } from "drizzle-orm"
import { pgTable, serial, text } from "drizzle-orm/pg-core"
import { withTimestamp } from "../../helpers/with-timestamp"
import { oauthAccountsTable } from "./oauth-accounts"
import { sessionsTable } from "./sessions"

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").unique().notNull(),
  username: text("username").notNull(),
  avatarUrl: text("avatar_url"),
  ...withTimestamp,
})

export type User = typeof usersTable.$inferSelect
export type NewUser = typeof usersTable.$inferInsert

export const usersRelations = relations(usersTable, ({ many }) => ({
  oauthAccounts: many(oauthAccountsTable),
  sessions: many(sessionsTable),
}))
