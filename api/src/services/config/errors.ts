import { Schema } from "effect"

/**
 * Configuration error for when environment variables are missing or invalid
 */
export class ConfigError extends Schema.TaggedError<ConfigError>("ConfigError")(
  "ConfigError",
  {
    cause: Schema.optional(Schema.Unknown),
    message: Schema.String,
  },
) {}
