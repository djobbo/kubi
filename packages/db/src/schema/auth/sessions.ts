import { relations } from "drizzle-orm"
import { pgTable, serial, text } from "drizzle-orm/pg-core"
import { withExpiry, withTimestamp } from "../../helpers/with-timestamp"
import { usersTable } from "./users"

export const sessionsTable = pgTable("sessions", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  ...withTimestamp,
  ...withExpiry,
})

export type Session = typeof sessionsTable.$inferSelect
export type NewSession = typeof sessionsTable.$inferInsert

export const sessionsRelations = relations(sessionsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [sessionsTable.userId],
    references: [usersTable.id],
  }),
}))
