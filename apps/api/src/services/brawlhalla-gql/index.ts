import { Fetcher } from "@/services/fetcher"
import {
  ArticlesResponse,
  BrawlhallaGqlApiClientService,
  getWeeklyRotation as fetchWeeklyRotation,
  layerBrawlhallaGqlApiClient,
} from "@dair/brawlhalla-gql-api"
import { Context, Effect, Layer, Schema } from "effect"


export class BrawlhallaGql extends Context.Service<BrawlhallaGql>()(
  "@dair/services/BrawlhallaGql",
  {
    make: Effect.gen(function* () {
      const client = yield* BrawlhallaGqlApiClientService
      const fetcher = yield* Fetcher

      const getArticles = Effect.fn("getArticles")(function* (
        query: {
          first?: number
          category?: string
          after?: string
          withContent?: boolean
          preview?: boolean
        } = {},
      ) {
        const cacheName = `brawlhalla-gql-articles-${query.preview ? "preview" : query.withContent ? "content" : "list"}-${query.category ?? ""}-${query.first ?? 6}-${query.after ?? ""}`

        const payload = {
          ...(query.first !== undefined ? { first: query.first } : {}),
          ...(query.category !== undefined ? { category: query.category } : {}),
          ...(query.after !== undefined ? { after: query.after } : {}),
        }

        const fetch = query.withContent
          ? client.articles.withContent({ payload })
          : query.preview
            ? client.articles.preview({ payload })
            : client.articles.list({ payload })

        return yield* fetcher.runCacheFirst({
          cacheName,
          schema: ArticlesResponse,
          fetch,
        })
      })

      return {
        getArticles,
        getWeeklyRotation: Effect.fn("getWeeklyRotation")(function* () {
          return yield* fetcher.runCacheFirst({
            cacheName: "brawlhalla-gql-weekly-rotation",
            schema: Schema.Array(
              Schema.Struct({
                id: Schema.Number,
                name_key: Schema.String,
                name: Schema.String,
              }),
            ),
            fetch: fetchWeeklyRotation(),
          })
        }),
      }
    }),
  },
) {
  static readonly layer = Layer.effect(this, this.make).pipe(
    Layer.provide(layerBrawlhallaGqlApiClient()),
    Layer.provide(Fetcher.layer),
  )
}
