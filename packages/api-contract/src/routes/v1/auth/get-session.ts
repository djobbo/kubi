import { Schema } from "effect"

// TODO: Remove this once we have a real session
const SessionStub = Schema.Struct({
  id: Schema.String,
})

export const GetSessionResponse = Schema.Struct({
  data: Schema.NullOr(SessionStub),
  meta: Schema.Struct({
    timestamp: Schema.String,
  }),
})
