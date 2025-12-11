import { type PgColumnBuilderBase, timestamp } from "drizzle-orm/pg-core"

export const withTimestamp = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
} as const satisfies Record<string, PgColumnBuilderBase>

export const withExpiry = {
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
} as const satisfies Record<string, PgColumnBuilderBase>
