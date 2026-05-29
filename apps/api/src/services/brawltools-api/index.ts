import { Cache } from "@/services/cache"
import {
  BrawltoolsApiClientService,
  layerBrawltoolsApiClient,
  PowerRankingsResponse,
  powerRankingsOrderFor,
  type PowerRankingsGameMode,
  type PowerRankingsOrderBy,
  type PowerRankingsRegion,
} from "@dair/brawltools-api"
import { Context, Duration, Effect, Layer, Option, Schema } from "effect"

const CACHE_MAX_AGE = 60 * 60

class BrawltoolsApiError extends Schema.TaggedErrorClass<BrawltoolsApiError>()(
  "BrawltoolsApiError",
  {
    message: Schema.String,
    cause: Schema.optional(Schema.Unknown),
  },
) {}

export class BrawltoolsApi extends Context.Service<BrawltoolsApi>()(
  "@dair/services/BrawltoolsApi",
  {
    make: Effect.gen(function* () {
      const client = yield* BrawltoolsApiClientService
      const cache = yield* Cache

      const getPowerRankings = Effect.fn("getPowerRankings")(function* ({
        region,
        page = 1,
        orderBy = "powerRanking",
        gameMode = "1v1",
        search = "",
      }: {
        region: PowerRankingsRegion
        page?: number
        orderBy?: PowerRankingsOrderBy
        gameMode?: PowerRankingsGameMode
        search?: string
      }) {
        const cacheKey = `brawltools-power-rankings-${gameMode}-${region}-${page}-${orderBy}-${search}`
        const order = powerRankingsOrderFor(orderBy)

        const query = {
          region,
          page,
          orderBy,
          ...(search !== "" ? { query: search } : {}),
        }

        const fetchFromApi =
          gameMode === "2v2"
            ? client.powerRankings.twoVTwo({ query })
            : client.powerRankings.oneVOne({ query })

        const result = yield* cache
          .getOrSet(
            cacheKey,
            PowerRankingsResponse,
            fetchFromApi,
            Option.some(Duration.seconds(CACHE_MAX_AGE)),
          )
          .pipe(
            Effect.catch((error) =>
              BrawltoolsApiError.make({
                message: "Brawltools API request failed",
                cause: error,
              }),
            ),
          )

        return {
          rankings: result.data,
          page,
          gameMode,
          region,
          orderBy,
          order,
          totalPages: result.data.totalPages,
          lastUpdated: result.data.lastUpdated,
          updatedAt: result.updatedAt,
        }
      })

      return { getPowerRankings }
    }),
  },
) {
  static readonly layer = Layer.effect(this, this.make).pipe(
    Layer.provide(layerBrawltoolsApiClient()),
    Layer.provide(Cache.layer),
  )
}
