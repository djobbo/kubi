import { Schema } from "effect"

export const GetLocationResponse = Schema.Struct({
  data: Schema.Struct({
    region: Schema.NullOr(Schema.String),
  }),
  meta: Schema.Struct({
    timestamp: Schema.Date,
  }),
})

