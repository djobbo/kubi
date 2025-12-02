import { Schema } from "effect"

/**
 * Error when a bookmark operation fails
 */
export class BookmarkError extends Schema.TaggedError<BookmarkError>(
  "BookmarkError",
)("BookmarkError", {
  message: Schema.String,
  cause: Schema.optional(Schema.Unknown),
}) {}

/**
 * Error when a bookmark is not found
 */
export class BookmarkNotFoundError extends Schema.TaggedError<BookmarkNotFoundError>(
  "BookmarkNotFoundError",
)("BookmarkNotFoundError", {
  pageId: Schema.String,
  pageType: Schema.String,
  userId: Schema.String,
}) {}

/**
 * Error when Discord account is not found during migration
 */
export class DiscordAccountNotFoundError extends Schema.TaggedError<DiscordAccountNotFoundError>(
  "DiscordAccountNotFoundError",
)("DiscordAccountNotFoundError", {
  userId: Schema.String,
}) {}
