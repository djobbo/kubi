import { fetchRevalidate } from "@/helpers/fetcher"
import { gql } from "@/helpers/gql"
import { Effect } from "effect"
import { parseWeeklyRotation } from "./helpers/parse-weekly-rotation"
import { Articles } from "./schema"

export const BRAWLHALLA_GRAPHQL_API_URL = "https://cms.brawlhalla.com/graphql"

const getArticleQuery = (withContent?: boolean) => gql`
  query ($category: String, $after: String, $first: Int = 6) {
    posts(first: $first, after: $after, where: { categoryName: $category }) {
      pageInfo {
        endCursor
      }
      nodes {
        title
        slug
        dateGmt
        excerpt
        ${withContent ? "content" : ""}
        author {
          node {
            databaseId
            name
          }
        }
        categories {
          nodes {
            name
            slug
          }
        }
        featuredImage {
          node {
            sourceUrl
            mediaDetails {
              height
              width
              sizes {
                name
                mimeType
                sourceUrl
                width
                height
              }
            }
          }
        }
      }
    }
  }
`

const getArticles = Effect.fn(function* (
  query: {
    first?: number
    category?: string
    after?: string
    withContent?: boolean
  } = {},
) {
  const articles = yield* fetchRevalidate(Articles, {
    method: "POST",
    url: BRAWLHALLA_GRAPHQL_API_URL,
    body: {
      query: getArticleQuery(query.withContent),
      variables: {
        first: query.first,
        category: query.category,
        after: query.after,
      },
    },
  })

  return articles
})

export const BrawlhallaGql = {
  getArticles,
  getWeeklyRotation: Effect.fn(function* () {
    const articles = yield* getArticles({
      category: "weekly-rotation",
      withContent: true,
      first: 1,
    })

    const weeklyRotation = yield* parseWeeklyRotation(
      articles.data.data.posts.nodes[0]?.content,
    )

    return {
      data: weeklyRotation,
      updatedAt: articles.updatedAt,
      cached: articles.cached,
    }
  }),
}
