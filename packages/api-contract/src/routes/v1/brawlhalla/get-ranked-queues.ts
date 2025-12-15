import { Schema } from "effect"

export const QueueItem = Schema.Struct({
  rating: Schema.Number,
  peakRating: Schema.Number,
  games: Schema.Number,
  wins: Schema.Number,
  tier: Schema.NullOr(Schema.String),
  region: Schema.NullOr(Schema.String),
  gamesDelta: Schema.Number,
  lastSeenAt: Schema.Date,
})

export const QueueItem1v1 = Schema.Struct({
  ...QueueItem.fields,
  name: Schema.String,
  playerId: Schema.Number,
  slug: Schema.String,
})

export const QueueItem2v2 = Schema.Struct({
  ...QueueItem.fields,
  players: Schema.Array(
    Schema.Struct({
      playerId: Schema.Number,
      name: Schema.String,
      slug: Schema.String,
    }),
  ),
})

export const QueueItemRotating = Schema.Struct({
  ...QueueItem.fields,
  name: Schema.String,
  playerId: Schema.Number,
  slug: Schema.String,
})

export const GetRankedQueues1v1Response = Schema.Struct({
  data: Schema.Array(QueueItem1v1),
  meta: Schema.Struct({
    queueType: Schema.Literal("1v1"),
    windowMinutes: Schema.Number,
  }),
})

export const GetRankedQueues2v2Response = Schema.Struct({
  data: Schema.Array(QueueItem2v2),
  meta: Schema.Struct({
    queueType: Schema.Literal("2v2"),
    windowMinutes: Schema.Number,
  }),
})

export const GetRankedQueuesRotatingResponse = Schema.Struct({
  data: Schema.Array(QueueItemRotating),
  meta: Schema.Struct({
    queueType: Schema.Literal("rotating"),
    windowMinutes: Schema.Number,
  }),
})
