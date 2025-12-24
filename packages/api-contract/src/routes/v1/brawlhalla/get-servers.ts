import { Schema } from "effect"

const Server = Schema.Struct({
  id: Schema.String,
  url: Schema.String,
  ip: Schema.String,
  location: Schema.Struct({
    city: Schema.String,
    country: Schema.String,
    lat: Schema.Number,
    lon: Schema.Number,
  }),
})

export const GetServersResponse = Schema.Struct({
  data: Schema.Array(Server),
  meta: Schema.Struct({
    timestamp: Schema.Date,
  }),
})

export const GetNearestServerResponse = Schema.Struct({
  data: Schema.Struct({
    server: Schema.NullOr(Server),
  }),
  meta: Schema.Struct({
    timestamp: Schema.Date,
  }),
})
