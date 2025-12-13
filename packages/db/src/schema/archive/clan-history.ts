import { relations, sql } from "drizzle-orm"
import {
  bigint,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core"

/**
 * Clan history table storing historical clan data from Brawlhalla API.
 * Uses hybrid approach: frequently queried fields as columns, rest in JSONB.
 */
export const clanHistoryTable = pgTable(
  "clan_history",
  {
    id: uuid("id").primaryKey().default(sql`uuidv7()`).primaryKey(),
    clanId: bigint("clan_id", { mode: "number" }).notNull(),
    recordedAt: timestamp("recorded_at", { withTimezone: true }).notNull(),

    // Extracted columns: fields used for ranking/filtering
    // From Clan (packages/api-contract/src/routes/v1/brawlhalla/get-guild-by-id)
    name: text("name"),
    xp: bigint("xp", { mode: "number" }),
    xpPercentage: bigint("xp_percentage", { mode: "number" }),
    level: bigint("level", { mode: "number" }),
    lifetimeXp: bigint("lifetime_xp", { mode: "number" }),
    membersCount: bigint("members_count", { mode: "number" }),
    createdDate: bigint("created_date", { mode: "number" }),

    // JSONB: everything else from the API response
    rawData: jsonb("raw_data").$type<unknown>(),
  },
  (table) => [
    // Index for filtering a single clan by id, returning all historical data sorted by date
    index("idx_clan_recorded").on(table.clanId, table.recordedAt),
    // Indexes for ranking queries
    index("idx_clan_xp").on(table.xp),
    index("idx_clan_level").on(table.level),
    index("idx_clan_lifetime_xp").on(table.lifetimeXp),
    index("idx_clan_members_count").on(table.membersCount),
    index("idx_clan_name").on(table.name),
    // Index for latest records (useful for ranking queries)
    index("idx_clan_recorded_at").on(table.recordedAt),
  ],
)

export type ClanHistory = typeof clanHistoryTable.$inferSelect
export type NewClanHistory = typeof clanHistoryTable.$inferInsert

export const clanHistoryRelations = relations(clanHistoryTable, () => ({
  // Relations can be added here if needed in the future
}))
