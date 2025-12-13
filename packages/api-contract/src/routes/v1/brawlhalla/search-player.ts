import { Schema } from "effect"

export const SearchPlayerItem = Schema.Struct({
  id: Schema.String,
  playerId: Schema.Number,
  slug: Schema.String,
  name: Schema.String,
  public: Schema.Boolean,
  createdAt: Schema.Date,
  updatedAt: Schema.Date,
  ranking: Schema.NullOr(
    Schema.Struct({
      rating: Schema.Number,
      peakRating: Schema.Number,
      tier: Schema.String,
      region: Schema.String,
    }),
  ),
  legend: Schema.NullOr(
    Schema.Struct({
      id: Schema.Number,
    }),
  ),
})

export const SearchPlayerCursor = Schema.Struct({
  createdAt: Schema.Date,
  id: Schema.String,
})

export const SearchPlayerResponse = Schema.Struct({
  data: Schema.Array(SearchPlayerItem),
  meta: Schema.Struct({
    nextCursor: Schema.NullOr(SearchPlayerCursor),
    query: Schema.String,
    timestamp: Schema.Date,
  }),
})
