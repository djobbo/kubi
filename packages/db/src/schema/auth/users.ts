import { sql } from "drizzle-orm"
import { pgTable, uuid, text } from "drizzle-orm/pg-core"
import { withTimestamp } from "../../helpers/with-timestamp"

export const usersTable = pgTable("users", {
  id: uuid("id")
    .primaryKey()
    .default(sql`uuidv7()`),

  email: text("email").unique().notNull(),
  username: text("username").notNull(),
  avatarUrl: text("avatar_url"),
  ...withTimestamp,
})

export type User = typeof usersTable.$inferSelect
export type NewUser = typeof usersTable.$inferInsert
