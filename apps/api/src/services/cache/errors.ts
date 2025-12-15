import { Schema } from "effect"

/**
 * Error when connecting to Redis fails
 */
export class CacheConnectionError extends Schema.TaggedError<CacheConnectionError>(
  "CacheConnectionError",
)("CacheConnectionError", {
  cause: Schema.optional(Schema.Unknown),
  message: Schema.String,
}) {}

/**
 * Error when a cache operation fails
 */
export class CacheOperationError extends Schema.TaggedError<CacheOperationError>(
  "CacheOperationError",
)("CacheOperationError", {
  cause: Schema.optional(Schema.Unknown),
  message: Schema.String,
}) {}

/**
 * Error when serialization/deserialization fails
 */
export class CacheSerializationError extends Schema.TaggedError<CacheSerializationError>(
  "CacheSerializationError",
)("CacheSerializationError", {
  cause: Schema.optional(Schema.Unknown),
  message: Schema.String,
}) {}
