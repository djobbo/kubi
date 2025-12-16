import { Effect, Schema } from "effect"
import type {
  GetNearestServerResponse,
  GetServersResponse,
} from "@dair/api-contract/src/routes/v1/brawlhalla/get-servers"
import { servers } from "@dair/brawlhalla-servers"

type Server = (typeof servers)[number]

const IpApiResponse = Schema.Struct({
  status: Schema.Literal("success"),
  lat: Schema.Number,
  lon: Schema.Number,
})

/**
 * Haversine formula to calculate distance between two coordinates
 */
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (x: number) => (x * Math.PI) / 180
  const R = 6371 // Earth radius in km
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export const getServers = Effect.fn("getServers")(function* () {
  return {
    data: servers,
    meta: { timestamp: new Date() },
  } satisfies typeof GetServersResponse.Type
})

export const getNearestServer = (ip: string | null) =>
  Effect.gen(function* () {
    if (!ip) {
      const response: typeof GetNearestServerResponse.Type = {
        data: { server: null },
        meta: { timestamp: new Date() },
      }
      return response
    }

    // Use native fetch to avoid HttpClient dependency
    const result = yield* Effect.tryPromise({
      try: () => fetch(`http://ip-api.com/json/${ip}`).then((r) => r.json()),
      catch: () => null,
    }).pipe(
      Effect.flatMap((data) =>
        Schema.decodeUnknown(IpApiResponse)(data).pipe(
          Effect.catchAll(() => Effect.succeed(null)),
        ),
      ),
      Effect.catchAll(() => Effect.succeed(null)),
    )

    if (!result) {
      const response: typeof GetNearestServerResponse.Type = {
        data: { server: null },
        meta: { timestamp: new Date() },
      }
      return response
    }

    const { lat, lon } = result

    const closestServer = servers.reduce(
      (closest: { server: Server; distance: number }, server: Server) => {
        const distance = getDistance(
          lat,
          lon,
          server.location.lat,
          server.location.lon,
        )
        return distance < closest.distance ? { server, distance } : closest
      },
      { server: servers[0], distance: Number.POSITIVE_INFINITY },
    )

    const response: typeof GetNearestServerResponse.Type = {
      data: { server: closestServer.server },
      meta: { timestamp: new Date() },
    }

    return response
  })
