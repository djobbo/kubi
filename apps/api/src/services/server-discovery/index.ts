import { lookup } from "node:dns/promises"
import { Context, Duration, Effect, Layer, Option, Schema } from "effect"
import { Cache } from "@/services/cache"

const SERVERS = [
  { id: "US-E", url: "pingtest-atl.brawlhalla.com" },
  { id: "US-W", url: "pingtest-cal.brawlhalla.com" },
  { id: "EU", url: "pingtest-ams.brawlhalla.com" },
  { id: "SEA", url: "pingtest-sgp.brawlhalla.com" },
  { id: "AUS", url: "pingtest-aus.brawlhalla.com" },
  { id: "BRZ", url: "pingtest-brs.brawlhalla.com" },
  { id: "JPN", url: "pingtest-jpn.brawlhalla.com" },
  { id: "ME", url: "pingtest-mde.brawlhalla.com" },
  { id: "SA", url: "pingtest-saf.brawlhalla.com" },
] as const satisfies ReadonlyArray<{ id: string; url: string }>

const IpApiResponse = Schema.Struct({
  status: Schema.Literals(["success"]),
  city: Schema.String,
  country: Schema.String,
  lat: Schema.Number,
  lon: Schema.Number,
  isp: Schema.String,
})

export const ServerInfo = Schema.Struct({
  id: Schema.String,
  url: Schema.String,
  ip: Schema.String,
  location: Schema.Struct({
    city: Schema.String,
    country: Schema.String,
    lat: Schema.Number,
    lon: Schema.Number,
    isp: Schema.String,
  }),
})

export type ServerInfo = typeof ServerInfo.Type

const ServersArray = Schema.Array(ServerInfo)

class ServerDiscoveryError extends Schema.TaggedErrorClass<ServerDiscoveryError>()(
  "ServerDiscoveryError",
  {
    message: Schema.String,
    cause: Schema.optional(Schema.Unknown),
  },
) {}

const CACHE_KEY = "brawlhalla:servers"
const CACHE_TTL = Duration.hours(6)

export class ServerDiscovery extends Context.Service<ServerDiscovery>()(
  "@dair/services/ServerDiscovery",
  {
    make: Effect.gen(function* () {
      const cache = yield* Cache

      const discoverServer = (server: { id: string; url: string }) =>
        Effect.gen(function* () {
          const ip = yield* Effect.tryPromise({
            try: () => lookup(server.url).then((result) => result.address),
            catch: (error) =>
              ServerDiscoveryError.make({
                message: `DNS lookup failed for ${server.url}`,
                cause: error,
              }),
          }).pipe(Effect.catch(() => Effect.succeed(null)))

          if (!ip) {
            yield* Effect.logWarning(
              `Failed to resolve DNS for ${server.id} (${server.url})`,
            )
            return null
          }

          const locationResult = yield* Effect.tryPromise({
            try: () =>
              fetch(`http://ip-api.com/json/${ip}`).then((r) => r.json()),
            catch: (error) =>
              ServerDiscoveryError.make({
                message: `IP API request failed for ${ip}`,
                cause: error,
              }),
          }).pipe(Effect.catch(() => Effect.succeed(null)))

          if (!locationResult) {
            yield* Effect.logWarning(
              `Failed to fetch location for ${server.id} (${ip})`,
            )
            return null
          }

          const location = yield* Schema.decodeUnknownEffect(IpApiResponse)(
            locationResult,
          ).pipe(
            Effect.catch(() => {
              return Effect.succeed(null)
            }),
          )

          if (!location) {
            yield* Effect.logWarning(
              `Failed to parse location response for ${server.id}`,
            )
            return null
          }

          return {
            id: server.id,
            url: server.url,
            ip,
            location: {
              city: location.city,
              country: location.country,
              lat: location.lat,
              lon: location.lon,
              isp: location.isp,
            },
          } satisfies ServerInfo
        })

      const discoverAllServers = Effect.fn("discoverAllServers")(function* () {
        yield* Effect.log("Starting server discovery...")

        const results = yield* Effect.all(
          SERVERS.map((server) => discoverServer(server)),
          { concurrency: 3 }, // Limit concurrency to avoid rate limits
        )

        const validServers: ServerInfo[] = results.filter(
          (server): server is NonNullable<typeof server> => server !== null,
        )

        yield* Effect.log(
          `Discovered ${validServers.length}/${SERVERS.length} servers`,
        )

        return validServers
      })

      return {
        getServers: Effect.fn("getServers")(function* () {
          const result = yield* cache.getOrSet(
            CACHE_KEY,
            ServersArray,
            discoverAllServers(),
            Option.some(CACHE_TTL),
          )
          return result.data
        }),

        refreshServers: Effect.fn("refreshServers")(function* () {
          yield* cache.remove(CACHE_KEY)
          const servers = yield* discoverAllServers()
          yield* cache.set(CACHE_KEY, servers, Option.some(CACHE_TTL))
          return servers
        }),
      }
    }),
  },
) {
  static readonly layer = Layer.effect(this, this.make).pipe(
    Layer.provide(Cache.layer),
  )
}
