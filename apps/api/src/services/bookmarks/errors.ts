import { Schema } from "effect"

/**
 * Error when a bookmark operation fails
 */
export class BookmarkError extends Schema.TaggedErrorClass<BookmarkError>()("BookmarkError", {
  message: Schema.String,
  cause: Schema.optional(Schema.Unknown),
}) {}

/**
 * Error when a bookmark is not found
 */
export class BookmarkNotFoundError extends Schema.TaggedErrorClass<BookmarkNotFoundError>()("BookmarkNotFoundError", {
  pageId: Schema.String,
  pageType: Schema.String,
  userId: Schema.String,
}) {}

/**
 * Error when Discord account is not found during migration
 */
export class DiscordAccountNotFoundError extends Schema.TaggedErrorClass<DiscordAccountNotFoundError>()("DiscordAccountNotFoundError", {
  userId: Schema.String,
}) {}
