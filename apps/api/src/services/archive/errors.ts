import { Schema } from "effect"

/**
 * Error when querying archive data fails
 */
export class ArchiveQueryError extends Schema.TaggedError<ArchiveQueryError>(
  "ArchiveQueryError",
)("ArchiveQueryError", {
  cause: Schema.optional(Schema.Unknown),
  message: Schema.String,
}) {}
