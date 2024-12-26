import { integer, json, text, timestamp, varchar } from "drizzle-orm/pg-core"

import { CACHE_VERSION } from "@/features/cache/constants"

import { apiCacheSchema } from "./schema"

export const apiCacheTable = apiCacheSchema.table("api-cache", {
  cacheName: text("cacheName").notNull(),
  cacheId: varchar("cacheId", { length: 256 }).primaryKey(),
  data: json("data"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  version: integer("version").default(CACHE_VERSION).notNull(),
})
