import { createServerFn } from "@tanstack/start"
import { cacheExchange, Client, fetchExchange, gql } from "@urql/core"
import { z } from "zod"

import { BRAWLHALLA_GRAPHQL_API_URL } from "../constants"

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

const authorSchema = z.object({
  name: z.string(),
})

const categorySchema = z.object({
  name: z.string(),
  slug: z.string(),
})

const imageSizeSchema = z.object({
  name: z.string(),
  mimeType: z.string(),
  sourceUrl: z.string(),
  width: z.coerce.number(),
  height: z.coerce.number(),
})

const featuredImageSchema = z.object({
  sourceUrl: z.string(),
  mediaDetails: z.object({
    height: z.number(),
    width: z.number(),
    sizes: z.array(imageSizeSchema),
  }),
})

const articleSchema = z
  .object({
    title: z.string(),
    slug: z.string(),
    dateGmt: z.string(),
    excerpt: z.string(),
    content: z.string().optional(),
    author: z.object({
      node: authorSchema,
    }),
    categories: z.object({
      nodes: z.array(categorySchema),
    }),
    featuredImage: z.object({
      node: featuredImageSchema,
    }),
  })
  .transform((data) => ({
    ...data,
    featuredImage: {
      ...data.featuredImage,
      sourceUrl: data.featuredImage.node.sourceUrl,
    },
    categories: data.categories.nodes,
  }))

const articlesSchema = z.object({
  posts: z.object({
    pageInfo: z.object({
      endCursor: z.string().nullable(),
    }),
    nodes: z.array(articleSchema),
  }),
})

const client = new Client({
  url: BRAWLHALLA_GRAPHQL_API_URL,
  exchanges: [cacheExchange, fetchExchange],
})

export const getBrawlhallaArticles = createServerFn({ method: "GET" })
  .validator(
    z.object({
      withContent: z.boolean().optional(),
      query: z
        .object({
          first: z.number().optional(),
          category: z.string().nullable().optional(),
          after: z.string().nullable().optional(),
        })
        .optional(),
    }),
  )
  .handler(async ({ data: { query, withContent } }) => {
    const { first = 3, category = null, after = null } = query ?? {}

    const result = await client
      .query(getArticleQuery(withContent), { first, category, after })
      .toPromise()

    const articles = articlesSchema.parse(result.data).posts.nodes

    return articles
  })

export type BrawlhallaArticle = z.infer<typeof articleSchema>
