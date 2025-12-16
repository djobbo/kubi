import { Schema } from "effect"

export const SearchGuildItem = Schema.Struct({
  id: Schema.Number,
  name: Schema.String,
  xp: Schema.Number,
  membersCount: Schema.Number,
  createdDate: Schema.NullOr(Schema.Number),
  recordedAt: Schema.Date,
})

export const SearchGuildResponse = Schema.Struct({
  data: Schema.Array(SearchGuildItem),
  meta: Schema.Struct({
    page: Schema.Number,
    limit: Schema.Number,
    hasMore: Schema.Boolean,
    total: Schema.NullOr(Schema.Number),
    query: Schema.NullOr(Schema.String),
    timestamp: Schema.Date,
  }),
})

