import { desc, eq } from "drizzle-orm"

import { apiCacheTable } from "@dair/schema/src/cache/api-cache"
import { db } from "../db"
import { env } from "../env"
import { logger } from "../helpers/logger"

export const DEFAULT_CACHE_MAX_AGE = 15 * 60 * 1000

interface Cache {
	version: number
	createdAt: Date
}

const isValidCache = <T extends Cache>(
	cache: T,
	maxAge = DEFAULT_CACHE_MAX_AGE,
) => {
	if (cache.version !== env.CACHE_VERSION) return false

	if (Date.now() - cache.createdAt.getTime() > maxAge) return false

	return true
}

export const withCache = async <T>(
	cacheName: string,
	fn: () => Promise<T>,
	maxAge = DEFAULT_CACHE_MAX_AGE,
) => {
	const [cached] = await db
		.select()
		.from(apiCacheTable)
		.where(eq(apiCacheTable.cacheName, cacheName))
		.orderBy(desc(apiCacheTable.createdAt))
		.limit(1)

	if (cached && isValidCache(cached, maxAge)) {
		logger.info(
			{
				cacheName,
				cacheId: cached.cacheId,
				createdAt: cached.createdAt,
				version: cached.version,
				cacheHit: true,
			},
			"Cache hit",
		)

		// TODO: Use validator?
		return { data: cached.data as T, updatedAt: cached.createdAt }
	}

	logger.info(
		{
			cacheName,
			cacheId: cached?.cacheId,
			createdAt: cached?.createdAt,
			version: cached?.version,
			cacheHit: false,
		},
		"Cache miss, fetching data from API",
	)

	let data: T

	try {
		data = await fn()
	} catch (error) {
		logger.error(
			{
				cacheName,
				error,
			},
			"Failed to fetch data from API",
		)
		if (cached) return { data: cached.data as T, updatedAt: cached.createdAt }
		throw error
	}

	await db
		.insert(apiCacheTable)
		.values({
			cacheName,
			cacheId: `${cacheName}-${Date.now()}`,
			data,
			version: env.CACHE_VERSION,
		})
		.onConflictDoNothing()

	return { data, updatedAt: new Date() }
}
