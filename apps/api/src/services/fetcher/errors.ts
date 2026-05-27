import { Schema } from "effect"

/**
 * Error when cache data is not found or expired
 */
export class CacheMissError extends Schema.TaggedErrorClass<CacheMissError>()("CacheMissError", {
  cacheName: Schema.String,
  message: Schema.optional(Schema.String),
}) {}

/**
 * Error when writing to cache fails
 */
export class CacheWriteError extends Schema.TaggedErrorClass<CacheWriteError>()("CacheWriteError", {
  cacheName: Schema.String,
  cause: Schema.optional(Schema.Unknown),
  message: Schema.String,
}) {}
