import { Config, Duration, Option, Schema } from "effect"
import { Effect } from "effect"
import { Redis } from "ioredis"

class CacheSerializationError extends Schema.TaggedError<CacheSerializationError>(
  "CacheSerializationError",
)("CacheSerializationError", {
  cause: Schema.optional(Schema.Unknown),
  message: Schema.String,
}) {}

class CacheOperationError extends Schema.TaggedError<CacheOperationError>(
  "CacheOperationError",
)("CacheOperationError", {
  method: Schema.String,
  cause: Schema.optional(Schema.Unknown),
  message: Schema.String,
}) {}

export class Cache extends Effect.Service<Cache>()("@dair/services/Cache", {
  effect: Effect.gen(function* () {
    const redisUrl = yield* Config.nonEmptyString("REDIS_URL").pipe(
      Config.withDefault("redis://localhost:6379"),
    )
    const prefix = yield* Config.nonEmptyString("CACHE_PREFIX").pipe(
      Config.withDefault("api:cache"),
    )
    const redis = new Redis(redisUrl)
    const prefixed = (key: string) => `${prefix}:${key}`
    const parse =
      <T, U>(schema: Schema.Schema<T, U>) =>
      (str: string | null): Option.Option<T> => {
        if (str === null) {
          return Option.none()
        }

        return Schema.decodeUnknownOption(schema)(JSON.parse(str))
      }

    const cache = {
      get: <T, U>(key: string, schema: Schema.Schema<T, U>) =>
        Effect.map(
          Effect.tryPromise({
            try: () => redis.get(prefixed(key)),
            catch: (error) =>
              CacheOperationError.make({
                method: "get",
                cause: error,
                message: "Failed to get cache",
              }),
          }),
          parse(schema),
        ).pipe(
          Effect.tap(() => Effect.log(`Got cache for ${key}`)),
          Effect.tapError(() =>
            Effect.logError(`Failed to get cache for ${key}`),
          ),
          Effect.catchAll(() => Effect.succeed(Option.none<T>())),
        ),
      set: (
        key: string,
        value: unknown,
        ttl: Option.Option<Duration.Duration>,
      ) =>
        Effect.tryMapPromise(
          Effect.try({
            try: () => JSON.stringify(value),
            catch: (error) =>
              CacheSerializationError.make({
                cause: error,
                message: "Failed to serialize cache value",
              }),
          }),
          {
            try: (value) =>
              ttl._tag === "None"
                ? redis.set(prefixed(key), value)
                : redis.set(
                    prefixed(key),
                    value,
                    "PX",
                    Duration.toMillis(ttl.value),
                  ),
            catch: (error) =>
              CacheOperationError.make({
                method: "set",
                cause: error,
                message: "Failed to set cache",
              }),
          },
        ).pipe(
          Effect.tap(() => Effect.log(`Set cache for ${key}`)),
          Effect.tapError(() =>
            Effect.logError(`Failed to set cache for ${key}`),
          ),
        ),
      remove: (key: string) =>
        Effect.tryPromise({
          try: () => redis.del(prefixed(key)),
          catch: (error) =>
            CacheOperationError.make({
              method: "remove",
              cause: error,
              message: "Failed to remove cache",
            }),
        }).pipe(
          Effect.tap(() => Effect.log(`Removed cache for ${key}`)),
          Effect.tapError(() =>
            Effect.logError(`Failed to remove cache for ${key}`),
          ),
        ),
      clear: Effect.tryPromise({
        try: () => redis.keys(`${prefix}:*`).then((keys) => redis.del(keys)),
        catch: (error) =>
          CacheOperationError.make({
            method: "clear",
            cause: error,
            message: "Failed to clear cache",
          }),
      }).pipe(
        Effect.tap(() => Effect.log(`Cleared cache`)),
        Effect.tapError(() => Effect.logError(`Failed to clear cache`)),
      ),
    }
    return {
      ...cache,
      getOrSet: <T, U, E>(
        key: string,
        schema: Schema.Schema<T, U>,
        lazyValue: Effect.Effect<T, E>,
        ttl: Option.Option<Duration.Duration>,
      ) =>
        cache
          .get(key, schema)
          .pipe(
            Effect.flatMap(
              Option.match({
                onSome: Effect.fnUntraced(function* (value) {
                  yield* Effect.log(`Got cache for ${key}`)
                  return {
                    data: value,
                    updatedAt: new Date(),
                    cached: true,
                  }
                }),
                onNone: Effect.fnUntraced(function* () {
                  yield* Effect.log(`No cache for ${key}, fetching...`)
                  const value = yield* lazyValue
                  yield* cache.set(key, value, ttl)
                  return {
                    data: value,
                    updatedAt: new Date(),
                    cached: false,
                  }
                }),
              }),
            ),
          )
          .pipe(
            Effect.tap(() => Effect.log(`Got or set cache for ${key}`)),
            Effect.tapError(() =>
              Effect.logError(`Failed to get or set cache for ${key}`),
            ),
          ),
    }
  }).pipe(
    Effect.tap(() => Effect.log(`Cache service initialized`)),
    Effect.tapError(() =>
      Effect.logError(`Failed to initialize cache service`),
    ),
  ),
}) {
  static readonly layer = this.Default
}
