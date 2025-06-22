import { Client, cacheExchange, fetchExchange, gql } from "@urql/core"

import type { z } from "zod/v4"
import { env } from "../../env"
import { withCache } from "../../helpers/with-cache"
import { parseWeeklyRotation } from "./helpers/parse-weekly-rotation"
import { articlesSchema } from "./helpers/schema"

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

const client = new Client({
	url: BRAWLHALLA_GRAPHQL_API_URL,
	exchanges: [cacheExchange, fetchExchange],
})

const getArticles = async (query: {
	first?: number
	category?: string
	after?: string
	withContent?: boolean
}) => {
	const {
		first = 3,
		category = null,
		after = null,
		withContent = false,
	} = query ?? {}

	const articles = await withCache(
		`brawlhalla-article-${category}-${first}-${after}`,
		async () => {
			const result = await client
				.query(getArticleQuery(withContent), { first, category, after })
				.toPromise()

			const articles = articlesSchema.parse(result.data).posts.nodes

			return articles
		},
		env.CACHE_MAX_AGE_OVERRIDE ?? 15 * 60 * 1000,
	)

	return articles
}

export type BrawlhallaArticle = z.infer<typeof articlesSchema>

export const brawlhallaGqlService = {
	getArticles,
	getWeeklyRotation: async () => {
		const articles = await withCache(
			"brawlhalla-weekly-rotation",
			async () => {
				const articles = await getArticles({
					first: 1,
					category: "weekly-rotation",
					withContent: true,
				})

				const content = articles.data[0]?.content
				return parseWeeklyRotation(content)
			},
			env.CACHE_MAX_AGE_OVERRIDE ?? 15 * 60 * 1000,
		)

		return articles
	},
}
