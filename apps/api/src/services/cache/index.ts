import { Effect, Layer, Option, Redacted, Schema } from "effect"
import { createClient, type RedisClientType } from "redis"
import { CacheConfig } from "./config"
import {
  CacheConnectionError,
  CacheOperationError,
  CacheSerializationError,
} from "./errors"

type CacheGetResult<T> = {
  data: T
  cached: boolean
  updatedAt: Date
}

export class Cache extends Effect.Service<Cache>()("@dair/services/Cache", {
  scoped: Effect.gen(function* () {
    const config = yield* CacheConfig

    // Create and connect Redis client
    const client: RedisClientType = createClient({
      url: Redacted.value(config.url),
    })

    // Connect to Redis
    yield* Effect.tryPromise({
      try: () => client.connect(),
      catch: (error) =>
        new CacheConnectionError({
          cause: error,
          message: "Failed to connect to Redis",
        }),
    })

    // Ensure graceful shutdown
    yield* Effect.addFinalizer(() =>
      Effect.tryPromise({
        try: () => client.quit(),
        catch: () => Effect.void,
      }).pipe(
        Effect.catchAll(() => Effect.void),
        Effect.tap(() => Effect.log("Redis connection closed")),
      ),
    )

    yield* Effect.log("Connected to Redis")

    /**
     * Get a value from cache
     */
    const get = <T, U>(key: string, schema: Schema.Schema<T, U>) =>
      Effect.gen(function* () {
        const raw = yield* Effect.tryPromise({
          try: () => client.get(key),
          catch: (error) =>
            new CacheOperationError({
              cause: error,
              message: `Failed to get key "${key}" from cache`,
            }),
        })

        if (raw === null) {
          return Option.none<CacheGetResult<T>>()
        }

        const parsed = yield* Effect.try({
          try: () => JSON.parse(raw) as { data: unknown; updatedAt: string },
          catch: (error) =>
            new CacheSerializationError({
              cause: error,
              message: `Failed to parse cached value for key "${key}"`,
            }),
        })

        const decoded = yield* Schema.decode(schema)(parsed.data as U).pipe(
          Effect.mapError(
            (error) =>
              new CacheSerializationError({
                cause: error,
                message: `Failed to decode cached value for key "${key}"`,
              }),
          ),
        )

        return Option.some<CacheGetResult<T>>({
          data: decoded,
          cached: true,
          updatedAt: new Date(parsed.updatedAt),
        })
      }).pipe(Effect.withSpan("Cache.get", { attributes: { key } }))

    /**
     * Set a value in cache with optional TTL
     */
    const set = <T, U>(
      key: string,
      value: T,
      schema: Schema.Schema<T, U>,
      ttlSeconds?: number,
    ) =>
      Effect.gen(function* () {
        const encoded = yield* Schema.encode(schema)(value).pipe(
          Effect.mapError(
            (error) =>
              new CacheSerializationError({
                cause: error,
                message: `Failed to encode value for key "${key}"`,
              }),
          ),
        )

        const payload = JSON.stringify({
          data: encoded,
          updatedAt: new Date().toISOString(),
        })

        const ttl = ttlSeconds ?? config.defaultTtlSeconds

        yield* Effect.tryPromise({
          try: () => client.setEx(key, ttl, payload),
          catch: (error) =>
            new CacheOperationError({
              cause: error,
              message: `Failed to set key "${key}" in cache`,
            }),
        })
      }).pipe(Effect.withSpan("Cache.set", { attributes: { key, ttlSeconds } }))

    /**
     * Delete a value from cache
     */
    const del = (key: string) =>
      Effect.gen(function* () {
        const result = yield* Effect.tryPromise({
          try: () => client.del(key),
          catch: (error) =>
            new CacheOperationError({
              cause: error,
              message: `Failed to delete key "${key}" from cache`,
            }),
        })

        return result > 0
      }).pipe(Effect.withSpan("Cache.delete", { attributes: { key } }))

    /**
     * Delete multiple keys matching a pattern
     */
    const deletePattern = (pattern: string) =>
      Effect.gen(function* () {
        const keys = yield* Effect.tryPromise({
          try: () => client.keys(pattern),
          catch: (error) =>
            new CacheOperationError({
              cause: error,
              message: `Failed to find keys matching pattern "${pattern}"`,
            }),
        })

        if (keys.length === 0) {
          return 0
        }

        const result = yield* Effect.tryPromise({
          try: () => client.del(keys),
          catch: (error) =>
            new CacheOperationError({
              cause: error,
              message: `Failed to delete keys matching pattern "${pattern}"`,
            }),
        })

        return result
      }).pipe(
        Effect.withSpan("Cache.deletePattern", { attributes: { pattern } }),
      )

    /**
     * Get or set a value in cache
     * If the key exists, return cached value. Otherwise, compute and cache the value.
     */
    const getOrSet = <T, U, E, R>(
      key: string,
      schema: Schema.Schema<T, U>,
      compute: Effect.Effect<T, E, R>,
      ttlSeconds?: number,
    ) =>
      Effect.gen(function* () {
        // Try to get from cache first
        const cached = yield* Effect.tryPromise({
          try: () => client.get(key),
          catch: (error) =>
            new CacheOperationError({
              cause: error,
              message: `Failed to get key "${key}" from cache`,
            }),
        })

        if (cached !== null) {
          const parsed = yield* Effect.try({
            try: () =>
              JSON.parse(cached) as { data: unknown; updatedAt: string },
            catch: (error) =>
              new CacheSerializationError({
                cause: error,
                message: `Failed to parse cached value for key "${key}"`,
              }),
          })

          const decoded = yield* Schema.decode(schema)(parsed.data as U).pipe(
            Effect.mapError(
              (error) =>
                new CacheSerializationError({
                  cause: error,
                  message: `Failed to decode cached value for key "${key}"`,
                }),
            ),
          )

          return {
            data: decoded,
            cached: true,
            updatedAt: new Date(parsed.updatedAt),
          } as CacheGetResult<T>
        }

        // Compute the value
        const value = yield* compute

        // Encode and cache the result
        const encoded = yield* Schema.encode(schema)(value).pipe(
          Effect.mapError(
            (error) =>
              new CacheSerializationError({
                cause: error,
                message: `Failed to encode value for key "${key}"`,
              }),
          ),
        )

        const payload = JSON.stringify({
          data: encoded,
          updatedAt: new Date().toISOString(),
        })

        const ttl = ttlSeconds ?? config.defaultTtlSeconds

        yield* Effect.tryPromise({
          try: () => client.setEx(key, ttl, payload),
          catch: (error) =>
            new CacheOperationError({
              cause: error,
              message: `Failed to set key "${key}" in cache`,
            }),
        })

        return {
          data: value,
          cached: false,
          updatedAt: new Date(),
        } as CacheGetResult<T>
      }).pipe(
        Effect.withSpan("Cache.getOrSet", { attributes: { key, ttlSeconds } }),
      )

    /**
     * Check if a key exists in cache
     */
    const has = (key: string) =>
      Effect.gen(function* () {
        const exists = yield* Effect.tryPromise({
          try: () => client.exists(key),
          catch: (error) =>
            new CacheOperationError({
              cause: error,
              message: `Failed to check if key "${key}" exists in cache`,
            }),
        })

        return exists > 0
      }).pipe(Effect.withSpan("Cache.has", { attributes: { key } }))

    /**
     * Get remaining TTL for a key in seconds
     */
    const ttl = (key: string) =>
      Effect.gen(function* () {
        const ttlValue = yield* Effect.tryPromise({
          try: () => client.ttl(key),
          catch: (error) =>
            new CacheOperationError({
              cause: error,
              message: `Failed to get TTL for key "${key}"`,
            }),
        })

        // -2 means key doesn't exist, -1 means no TTL set
        if (ttlValue < 0) {
          return Option.none<number>()
        }

        return Option.some(ttlValue)
      }).pipe(Effect.withSpan("Cache.ttl", { attributes: { key } }))

    /**
     * Update the TTL for an existing key
     */
    const expire = (key: string, ttlSeconds: number) =>
      Effect.gen(function* () {
        const result = yield* Effect.tryPromise({
          try: () => client.expire(key, ttlSeconds),
          catch: (error) =>
            new CacheOperationError({
              cause: error,
              message: `Failed to set TTL for key "${key}"`,
            }),
        })

        return result
      }).pipe(
        Effect.withSpan("Cache.expire", { attributes: { key, ttlSeconds } }),
      )

    return {
      get,
      set,
      delete: del,
      deletePattern,
      getOrSet,
      has,
      ttl,
      expire,
    }
  }),
}) {
  static readonly layer = this.Default.pipe(Layer.provide(CacheConfig.layer))
}

export { CacheConfig } from "./config"
export {
  CacheConnectionError,
  CacheOperationError,
  CacheSerializationError,
} from "./errors"
