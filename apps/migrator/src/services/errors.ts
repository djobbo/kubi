import { Schema } from "effect"

export class MigrationFetchError extends Schema.TaggedErrorClass<MigrationFetchError>()(
  "MigrationFetchError",
  {
    message: Schema.String,
    cause: Schema.optional(Schema.Unknown),
  },
) {}

export class MigrationWriteError extends Schema.TaggedErrorClass<MigrationWriteError>()(
  "MigrationWriteError",
  {
    message: Schema.String,
    cause: Schema.optional(Schema.Unknown),
  },
) {}
