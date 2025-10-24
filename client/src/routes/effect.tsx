import { Registry } from "@effect-atom/atom-react";
import { createFileRoute } from "@tanstack/react-router";
import { Effect } from "effect";

export const Route = createFileRoute("/effect")({
  component: RouteComponent,
  loader: ({ context: { ApiClient } }) =>
    Effect.runPromise(
      Effect.gen(function* () {
        const articles = yield* ApiClient.brawlhalla["get-preview-articles"]();

        return {
          articles: articles.data,
        };
      }).pipe(Effect.provide(Registry.layer))
    ),
});

function RouteComponent() {
  const { articles } = Route.useLoaderData();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {articles.map((article) => (
        <div key={article.slug} className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold">{article.title}</h2>
          <img
            src={article.thumbnail.src}
            alt={article.title}
            className="w-full h-auto"
          />
        </div>
      ))}
    </div>
  );
}
