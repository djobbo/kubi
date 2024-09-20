import {text, timestamp} from "drizzle-orm/pg-core"

import {authSchema} from "./schema"

export const usersTable = authSchema.table("user", {
  id: text("id").primaryKey(),
  name: text("name"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  avatarUrl: text("avatar_url"),
  email: text("email"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export type User = typeof usersTable.$inferSelect