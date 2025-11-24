import { Schema } from "effect"

/**
 * Generic Brawlhalla API error
 */
export class BrawlhallaApiError extends Schema.TaggedError<BrawlhallaApiError>(
  "BrawlhallaApiError",
)("BrawlhallaApiError", {
  cause: Schema.optional(Schema.Unknown),
  message: Schema.String,
  status: Schema.Number.pipe(Schema.optionalWith({ default: () => 500 })),
}) {}

/**
 * Error when a player is not found in Brawlhalla API
 */
export class BrawlhallaPlayerNotFound extends Schema.TaggedError<BrawlhallaPlayerNotFound>(
  "BrawlhallaPlayerNotFound",
)("BrawlhallaPlayerNotFound", {
  playerId: Schema.Number,
}) {}

/**
 * Error when a clan is not found in Brawlhalla API
 */
export class BrawlhallaClanNotFound extends Schema.TaggedError<BrawlhallaClanNotFound>(
  "BrawlhallaClanNotFound",
)("BrawlhallaClanNotFound", {
  clanId: Schema.Number,
}) {}

/**
 * Error when Brawlhalla API rate limit is exceeded
 */
export class BrawlhallaRateLimitError extends Schema.TaggedError<BrawlhallaRateLimitError>(
  "BrawlhallaRateLimitError",
)("BrawlhallaRateLimitError", {
  message: Schema.String,
}) {}
