import { desc, eq } from "drizzle-orm"

import { db } from "@/db"
import { CACHE_MAX_AGE, CACHE_VERSION } from "@/features/cache/constants"
import { apiCacheTable } from "@/features/cache/schema"

interface Cache {
  version: number
  createdAt: Date
}

const isValidCache = <T extends Cache>(cache: T, maxAge = CACHE_MAX_AGE) => {
  if (cache.version !== CACHE_VERSION) return false

  if (Date.now() - cache.createdAt.getTime() > maxAge) return false

  return true
}

export const withCache = async <T>(
  cacheName: string,
  fn: () => Promise<T>,
  maxAge = CACHE_MAX_AGE,
) => {
  const [cached] = await db
    .select()
    .from(apiCacheTable)
    .where(eq(apiCacheTable.cacheName, cacheName))
    .orderBy(desc(apiCacheTable.createdAt))
    .limit(1)

  if (cached && isValidCache(cached, maxAge)) {
    console.log("Cache hit", cacheName)

    // TODO: Use validator?
    return cached.data as T
  }

  console.log(
    "Cache miss, fetching data from API",
    cacheName,
    cached && { createdAt: cached.createdAt, version: cached.version },
  )

  let data: T

  try {
    data = await fn()
  } catch (error) {
    console.error("Failed to fetch data from API", cacheName, error)
    if (cached) return cached.data as T
    throw error
  }

  await db
    .insert(apiCacheTable)
    .values({
      cacheName,
      cacheId: `${cacheName}-${Date.now()}`,
      data,
    })
    .onConflictDoNothing()

  return data
}
