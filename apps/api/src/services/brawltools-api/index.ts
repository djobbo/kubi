import { Effect, Layer, Schema, Duration, Option } from "effect"
import {
  FetchHttpClient,
  HttpClient,
  HttpClientRequest,
  HttpClientResponse,
} from "@effect/platform"
import { Cache } from "@/services/cache"
import type {
  PowerRankingsGameMode,
  PowerRankingsOrderBy,
  PowerRankingsOrder,
  PowerRankingsRegion,
} from "@dair/api-contract/src/routes/v1/brawlhalla/get-power-rankings"

const BRAWLTOOLS_API_URL = "https://api.brawltools.com/v2"
const MAX_RESULTS = 50
const CACHE_MAX_AGE = 60 * 60 // 1 hour

export const BrawltoolsPowerRankingsResponse = Schema.Struct({
  prPlayers: Schema.Array(
    Schema.Struct({
      playerId: Schema.Number,
      playerName: Schema.String,
      twitter: Schema.optional(Schema.String),
      twitch: Schema.optional(Schema.String),
      top8: Schema.Number,
      top32: Schema.Number,
      gold: Schema.Number,
      silver: Schema.Number,
      bronze: Schema.Number,
      powerRanking: Schema.Number,
      points: Schema.Number,
      earnings: Schema.Number,
    }),
  ),
  totalPages: Schema.Number,
  lastUpdated: Schema.String,
})

export const powerRankedGameModeMap: Record<PowerRankingsGameMode, string> = {
  "1v1": "1",
  "2v2": "2",
}

export class BrawltoolsApiError extends Schema.TaggedError<BrawltoolsApiError>(
  "BrawltoolsApiError",
)("BrawltoolsApiError", {
  message: Schema.String,
  cause: Schema.optional(Schema.Unknown),
}) {}

export class BrawltoolsApi extends Effect.Service<BrawltoolsApi>()(
  "@dair/services/BrawltoolsApi",
  {
    effect: Effect.gen(function* () {
      const httpClient = yield* HttpClient.HttpClient
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
        const cacheKey = `brawltools-power-rankings-${gameMode}-${region ?? "all"}-${page}-${orderBy}-${search}`
        const order: PowerRankingsOrder =
          orderBy === "powerRanking" ? "ASC" : "DESC"
        const url = new URL(`${BRAWLTOOLS_API_URL}/pr`)
        url.searchParams.set("gameMode", powerRankedGameModeMap[gameMode])
        url.searchParams.set("orderBy", `${orderBy} ${order}`)
        url.searchParams.set("page", page.toString())
        url.searchParams.set("region", region)
        url.searchParams.set("query", search)
        url.searchParams.set("maxResults", MAX_RESULTS.toString())

        const fetchFromApi = HttpClientRequest.get(url.toString()).pipe(
          httpClient.execute,
          Effect.flatMap(
            HttpClientResponse.schemaBodyJson(BrawltoolsPowerRankingsResponse),
          ),
        )

        const result = yield* cache
          .getOrSet(
            cacheKey,
            BrawltoolsPowerRankingsResponse,
            fetchFromApi,
            Option.some(Duration.seconds(CACHE_MAX_AGE)),
          )
          .pipe(
            Effect.catchTags({
              ResponseError: (error) =>
                BrawltoolsApiError.make({
                  message: `Brawltools API request failed with status ${error.response.status}`,
                  cause: error,
                }),
              ParseError: (error) =>
                BrawltoolsApiError.make({
                  message: "Failed to parse Brawltools API response",
                  cause: error,
                }),
              RequestError: (error) =>
                BrawltoolsApiError.make({
                  message: "Failed to make request to Brawltools API",
                  cause: error,
                }),
            }),
          )

        return {
          rankings: result.data,
          page,
          gameMode,
          region,
          orderBy,
          order,
          updatedAt: result.updatedAt,
        }
      })

      return {
        getPowerRankings,
      }
    }),
  },
) {
  static readonly layer = this.Default.pipe(
    Layer.provide(Cache.layer),
    Layer.provide(FetchHttpClient.layer),
  )
}
