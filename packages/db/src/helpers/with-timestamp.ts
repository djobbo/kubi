import { timestamp } from "drizzle-orm/pg-core"

export const withTimestamp = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
} as const

export const withExpiry = {
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
} as const

export const withRecordedAt = {
  recordedAt: timestamp("recorded_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
} as const
