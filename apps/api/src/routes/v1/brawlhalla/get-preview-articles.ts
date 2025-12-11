import { BrawlhallaGql } from "@/services/brawlhalla-gql"
import type { GetPreviewArticlesResponse } from "@dair/api-contract/src/routes/v1/brawlhalla/get-preview-articles"
import {
  InternalServerError,
  NotFound,
  TooManyRequests,
} from "@dair/api-contract/src/shared/errors"
import { Effect } from "effect"

export const getPreviewArticles = () =>
  Effect.gen(function* () {
    const articles = yield* BrawlhallaGql.getArticles({
      withContent: false,
      first: 3,
    })

    const response: typeof GetPreviewArticlesResponse.Type = {
      data: articles.data.data.posts.nodes.map((node) => ({
        title: node.title,
        slug: node.slug,
        date_gmt: node.dateGmt,
        excerpt: node.excerpt,
        thumbnail: {
          src: node.featuredImage.node.sourceUrl,
        },
        categories: node.categories.nodes.map((category) => ({
          name: category.name,
          slug: category.slug,
        })),
      })),
      meta: {
        updated_at: articles.updatedAt,
      },
    }

    return response
  })
