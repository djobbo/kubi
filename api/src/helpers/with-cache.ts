import { desc, eq } from 'drizzle-orm';

import { db } from '../db';
import { apiCacheTable } from '@dair/schema/src/cache/api-cache';
import { env } from '../env';

export const DEFAULT_CACHE_MAX_AGE = 15 * 60 * 1000;

interface Cache {
  version: number;
  createdAt: Date;
}

const isValidCache = <T extends Cache>(cache: T, maxAge = DEFAULT_CACHE_MAX_AGE) => {
  if (cache.version !== env.CACHE_VERSION) return false;

  console.log(Date.now(), cache.createdAt.getTime(), Date.now() - cache.createdAt.getTime() > maxAge, maxAge)

  if (Date.now() - cache.createdAt.getTime() > maxAge) return false;

  return true;
};

export const withCache = async <T>(
  cacheName: string,
  fn: () => Promise<T>,
  maxAge = DEFAULT_CACHE_MAX_AGE
) => {
  const [cached] = await db
    .select()
    .from(apiCacheTable)
    .where(eq(apiCacheTable.cacheName, cacheName))
    .orderBy(desc(apiCacheTable.createdAt))
    .limit(1);

    console.log(cached)

  if (cached && isValidCache(cached, maxAge)) {
    console.log('Cache hit', cacheName);

    // TODO: Use validator?
    return {data: cached.data as T, createdAt: cached.createdAt};
  }

  console.log(
    'Cache miss, fetching data from API',
    cacheName,
    cached && { createdAt: cached.createdAt, version: cached.version }
  );

  let data: T;

  try {
    data = await fn();
  } catch (error) {
    console.error('Failed to fetch data from API', cacheName, error);
    if (cached) return {data: cached.data as T, createdAt: cached.createdAt};
    throw error;
  }

  await db
    .insert(apiCacheTable)
    .values({
      cacheName,
      cacheId: `${cacheName}-${Date.now()}`,
      data,
      version: env.CACHE_VERSION,
    })
    .onConflictDoNothing();

  return {data, createdAt: new Date()};
};
