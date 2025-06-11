import { relations } from "drizzle-orm"
import { sqliteTable, text } from "drizzle-orm/sqlite-core"
import { usersTable } from "./users"
import { withExpiry, withTimestamp } from '../helpers/with-timestamp'

export const sessionsTable = sqliteTable("sessions", {
	id: text("id").primaryKey().notNull(),
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
