import { Schema } from "effect"

export const GetWeeklyRotationResponse = Schema.Struct({
  data: Schema.Array(
    Schema.Struct({
      id: Schema.Number,
      name: Schema.String,
      name_key: Schema.String,
    }),
  ),
  meta: Schema.Struct({
    updated_at: Schema.Date,
  }),
})
