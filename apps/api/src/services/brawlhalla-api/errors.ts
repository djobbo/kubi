import { Effect, Schema } from "effect"

/**
 * Generic Brawlhalla API error
 */
export class BrawlhallaApiError extends Schema.TaggedErrorClass<BrawlhallaApiError>()("BrawlhallaApiError", {
  cause: Schema.optional(Schema.Unknown),
  message: Schema.String,
  status: Schema.Number.pipe(Schema.withDecodingDefaultType(Effect.succeed(500))),
}) {}

/**
 * Error when a player is not found in Brawlhalla API
 */
export class BrawlhallaPlayerNotFound extends Schema.TaggedErrorClass<BrawlhallaPlayerNotFound>()("BrawlhallaPlayerNotFound", {
  playerId: Schema.Number,
  status: Schema.Number.pipe(Schema.withDecodingDefaultType(Effect.succeed(404))),
}) {}

/**
 * Error when a clan is not found in Brawlhalla API
 */
export class BrawlhallaClanNotFound extends Schema.TaggedErrorClass<BrawlhallaClanNotFound>()("BrawlhallaClanNotFound", {
  clanId: Schema.Number,
  status: Schema.Number.pipe(Schema.withDecodingDefaultType(Effect.succeed(404))),
}) {}

/**
 * Error when Brawlhalla API rate limit is exceeded
 */
export class BrawlhallaRateLimitError extends Schema.TaggedErrorClass<BrawlhallaRateLimitError>()("BrawlhallaRateLimitError", {
  message: Schema.String,
  status: Schema.Number.pipe(Schema.withDecodingDefaultType(Effect.succeed(429))),
}) {}

export class BrawlhallaServiceUnavailable extends Schema.TaggedErrorClass<BrawlhallaServiceUnavailable>()("BrawlhallaServiceUnavailable", {
  message: Schema.String,
  status: Schema.Number.pipe(Schema.withDecodingDefaultType(Effect.succeed(503))),
}) {}
