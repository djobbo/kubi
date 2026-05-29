import {
  Config,
  Context,
  Duration,
  Effect,
  Layer,
  Option,
  Schema,
} from "effect"
import { Redis } from "ioredis"

class CacheSerializationError extends Schema.TaggedErrorClass<CacheSerializationError>()(
  "CacheSerializationError",
  {
    cause: Schema.optional(Schema.Unknown),
    message: Schema.String,
  },
) {}

class CacheOperationError extends Schema.TaggedErrorClass<CacheOperationError>()(
  "CacheOperationError",
  {
    method: Schema.String,
    cause: Schema.optional(Schema.Unknown),
    message: Schema.String,
  },
) {}

type CacheResult<T> = {
  readonly data: T
  readonly updatedAt: Date
  readonly cached: boolean
}

const decodeCachedValue = <T>(
  schema: Schema.Schema<T>,
  raw: string | null,
): Effect.Effect<Option.Option<T>, never, never> =>
  Effect.sync((): Option.Option<T> => {
    if (raw === null) {
      return Option.none()
    }

    try {
      const parsed = JSON.parse(raw) as unknown
      const decoded = Schema.decodeUnknownSync(
        schema as Schema.Decoder<unknown, never>,
      )(parsed) as T
      return Option.some(decoded)
    } catch {
      return Option.none()
    }
  })

export class Cache extends Context.Service<Cache>()("@dair/services/Cache", {
  make: Effect.gen(function* () {
    const redisUrl = yield* Config.nonEmptyString("REDIS_URL").pipe(
      Config.withDefault("redis://localhost:6379"),
    )
    const prefix = yield* Config.nonEmptyString("CACHE_PREFIX").pipe(
      Config.withDefault("api:cache"),
    )

    const redis = yield* Effect.acquireRelease(
      Effect.sync(() => new Redis(redisUrl)),
      (client) => Effect.promise(() => client.quit()).pipe(Effect.ignore),
    )

    const cacheKey = (name: string) => `${prefix}:${name}`

    const redisIo = <A>(method: string, run: () => Promise<A>) =>
      Effect.tryPromise({
        try: run,
        catch: (cause) =>
          CacheOperationError.make({
            method,
            cause,
            message: `Redis ${method} failed`,
          }),
      })

    const get = <T>(name: string, schema: Schema.Schema<T>) =>
      redisIo("get", () => redis.get(cacheKey(name))).pipe(
        Effect.flatMap((raw) => decodeCachedValue(schema, raw)),
        Effect.catch(() => Effect.succeed(Option.none<T>())),
        Effect.withSpan("Cache.get"),
      )

    const set = Effect.fn("Cache.set")(function* (
      name: string,
      value: unknown,
      ttl: Option.Option<Duration.Duration>,
    ) {
      const serialized = yield* Effect.try({
        try: () => JSON.stringify(value),
        catch: (cause) =>
          CacheSerializationError.make({
            cause,
            message: "Failed to serialize cache value",
          }),
      })

      yield* Option.match(ttl, {
        onNone: () =>
          redisIo("set", () => redis.set(cacheKey(name), serialized)),
        onSome: (duration) =>
          redisIo("set", () =>
            redis.set(
              cacheKey(name),
              serialized,
              "PX",
              Duration.toMillis(duration),
            ),
          ),
      })
    })

    const remove = Effect.fn("Cache.remove")(function* (name: string) {
      yield* redisIo("del", () => redis.del(cacheKey(name)))
    })

    const clear = Effect.fn("Cache.clear")(function* () {
      const keys = yield* redisIo("keys", () => redis.keys(`${prefix}:*`))
      if (keys.length > 0) {
        yield* redisIo("del", () => redis.del(keys))
      }
    })

    const getOrSet = Effect.fn("Cache.getOrSet")(function* <T, E>(
      name: string,
      schema: Schema.Schema<T>,
      lazyValue: Effect.Effect<T, E>,
      ttl: Option.Option<Duration.Duration>,
    ) {
      const cached = yield* get(name, schema)

      if (Option.isSome(cached)) {
        return {
          data: cached.value,
          updatedAt: new Date(),
          cached: true,
        } as CacheResult<T>
      }

      const data = yield* lazyValue
      yield* set(name, data, ttl)

      return {
        data,
        updatedAt: new Date(),
        cached: false,
      } as CacheResult<T>
    })

    return { get, set, remove, clear, getOrSet }
  }).pipe(Effect.tap(() => Effect.log("Cache service initialized"))),
}) {
  static readonly layer = Layer.effect(this, this.make)
}
