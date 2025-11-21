import { Schema } from "effect"

export const DeleteSessionResponse = Schema.Struct({
  data: Schema.Struct({
    message: Schema.String,
  }),
  meta: Schema.Struct({
    timestamp: Schema.String,
  }),
})
