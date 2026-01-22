import { Effect, Schema } from "effect"
import type {
  GetNearestServerResponse,
  GetServersResponse,
} from "@dair/api-contract/src/routes/v1/brawlhalla/get-servers"
import { ServerDiscovery, type ServerInfo } from "@/services/server-discovery"

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

function findClosestServer(
  servers: readonly ServerInfo[],
  lat: number,
  lon: number,
): ServerInfo | null {
  if (servers.length === 0) return null

  let closest = servers[0]!
  let minDistance = getDistance(
    lat,
    lon,
    closest.location.lat,
    closest.location.lon,
  )

  for (let i = 1; i < servers.length; i++) {
    const server = servers[i]!
    const distance = getDistance(
      lat,
      lon,
      server.location.lat,
      server.location.lon,
    )
    if (distance < minDistance) {
      closest = server
      minDistance = distance
    }
  }

  return closest
}

export const getServers = Effect.fn("getServers")(function* () {
  const serverDiscovery = yield* ServerDiscovery
  const servers = yield* serverDiscovery.getServers()

  return {
    data: servers,
    meta: { timestamp: new Date() },
  } satisfies typeof GetServersResponse.Type
})

export const getNearestServer = (ip: string | null) =>
  Effect.gen(function* () {
    const serverDiscovery = yield* ServerDiscovery
    const servers = yield* serverDiscovery.getServers()

    if (!ip || servers.length === 0) {
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
    const closestServer = findClosestServer(servers, lat, lon)

    const response: typeof GetNearestServerResponse.Type = {
      data: { server: closestServer },
      meta: { timestamp: new Date() },
    }

    return response
  })
