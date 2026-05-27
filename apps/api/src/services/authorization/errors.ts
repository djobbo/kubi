import { Schema } from "effect"

/**
 * Error when a session is not found
 */
export class SessionNotFoundError extends Schema.TaggedErrorClass<SessionNotFoundError>()(
  "SessionNotFoundError",
  {
    sessionId: Schema.String,
  },
) {}

/**
 * Error when a session has expired
 */
export class SessionExpiredError extends Schema.TaggedErrorClass<SessionExpiredError>()(
  "SessionExpiredError",
  {
    sessionId: Schema.String,
  },
) {}

/**
 * Error during OAuth validation
 */
export class OAuthValidationError extends Schema.TaggedErrorClass<OAuthValidationError>()(
  "OAuthValidationError",
  {
    provider: Schema.String,
    cause: Schema.optional(Schema.Unknown),
    message: Schema.String,
  },
) {}

/**
 * Error when a user is not found
 */
export class UserNotFoundError extends Schema.TaggedErrorClass<UserNotFoundError>()(
  "UserNotFoundError",
  {
    userId: Schema.String,
  },
) {}
