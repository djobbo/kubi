import { Schema } from "effect"

/**
 * Error when connecting to the database fails
 */
export class DBConnectionError extends Schema.TaggedError<DBConnectionError>(
  "DBConnectionError",
)("DBConnectionError", {
  cause: Schema.optional(Schema.Unknown),
  message: Schema.String,
}) {}

/**
 * Error when a database query fails
 */
export class DBQueryError extends Schema.TaggedError<DBQueryError>(
  "DBQueryError",
)("DBQueryError", {
  cause: Schema.optional(Schema.Unknown),
  message: Schema.String,
}) {}
