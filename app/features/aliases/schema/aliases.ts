import type { InferSelectModel } from "drizzle-orm"
import {
  boolean,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core"
import { createInsertSchema } from "drizzle-zod"
import type { z } from "zod"

import { aliasesSchema } from "./schema"

export const aliasesTable = aliasesSchema.table(
  "aliases",
  {
    id: serial("id").primaryKey(),
    alias: text("alias").notNull(),
    playerId: text("player_id").notNull(),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow(),
    public: boolean("public").notNull().default(true),
  },
  (table) => ({
    uniqueAlias: uniqueIndex("unique_alias").on(table.playerId, table.alias),
  }),
)

export type Alias = InferSelectModel<typeof aliasesTable>

export const aliasesInsertSchema = createInsertSchema(aliasesTable)

export type NewAlias = z.infer<typeof aliasesInsertSchema>
