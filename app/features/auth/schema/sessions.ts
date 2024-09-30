import { text, timestamp } from "drizzle-orm/pg-core"

import { authSchema } from "@/features/auth/schema/schema"
import { usersTable } from "@/features/auth/schema/users"

export const sessionsTable = authSchema.table("session", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
})
