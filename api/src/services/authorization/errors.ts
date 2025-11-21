import { Schema } from "effect"

/**
 * Error when a session is not found
 */
export class SessionNotFoundError extends Schema.TaggedError<SessionNotFoundError>(
  "SessionNotFoundError",
)("SessionNotFoundError", {
  sessionId: Schema.String,
}) {}

/**
 * Error when a session has expired
 */
export class SessionExpiredError extends Schema.TaggedError<SessionExpiredError>(
  "SessionExpiredError",
)("SessionExpiredError", {
  sessionId: Schema.String,
}) {}

/**
 * Error during OAuth validation
 */
export class OAuthValidationError extends Schema.TaggedError<OAuthValidationError>(
  "OAuthValidationError",
)("OAuthValidationError", {
  provider: Schema.String,
  cause: Schema.optional(Schema.Unknown),
  message: Schema.String,
}) {}

/**
 * Error when a user is not found
 */
export class UserNotFoundError extends Schema.TaggedError<UserNotFoundError>(
  "UserNotFoundError",
)("UserNotFoundError", {
  userId: Schema.String,
}) {}
