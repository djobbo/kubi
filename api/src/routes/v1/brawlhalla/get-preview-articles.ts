import { Effect } from "effect";
import {
  InternalServerError,
  NotFound,
  ServiceUnavailable,
} from "@effect/platform/HttpApiError";
import { BrawlhallaGql } from "@/services/brawlhalla-gql";
import type { GetPreviewArticlesResponse } from "@dair/api-contract/src/routes/v1/brawlhalla/get-preview-articles";

export const getPreviewArticles = () =>
  Effect.gen(function* () {
    const articles = yield* BrawlhallaGql.getArticles({
      withContent: false,
      first: 3,
    });

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
    };

    return response;
  }).pipe(
    Effect.tapError(Effect.logError),
    Effect.catchTags({
      ResponseError: Effect.fn(function* (error) {
        switch (error.response.status) {
          case 404:
            return yield* Effect.fail(new NotFound());
          case 429:
            return yield* Effect.fail(new ServiceUnavailable());
          default:
            return yield* Effect.fail(new InternalServerError());
        }
      }),
      DBError: () => Effect.fail(new InternalServerError()),
      ParseError: () => Effect.fail(new InternalServerError()),
      RequestError: () => Effect.fail(new InternalServerError()),
      TimeoutException: () => Effect.fail(new InternalServerError()),
      HttpBodyError: () => Effect.fail(new InternalServerError()),
      ConfigError: Effect.die,
    }),
    Effect.withSpan("get-preview-articles")
  );
