import { Trans } from '@lingui/react/macro';
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';

import { getBrawlhallaArticles } from '@/features/bh-articles/functions/getBrawlhallaArticles';

import { ArticlePreviewGrid } from './articles/ArticlePreviewGrid';
import { SectionTitle } from './layout/SectionTitle';

export const LandingArticles = () => {
  const { data: articles } = useSuspenseQuery(
    queryOptions({
      queryKey: ['landingArticles'],
      queryFn: async () => {
        const articles = getBrawlhallaArticles({
          data: {
            query: { first: 3, category: null, after: null },
          },
        });

        return articles;
      },
    })
  );

  if (!articles || articles.length <= 0) return null;

  return (
    <>
      <SectionTitle className="text-center mt-16">
        <Trans>Latest News</Trans>
      </SectionTitle>
      <ArticlePreviewGrid articles={articles} />
    </>
  );
};
