import { Trans } from "@lingui/react/macro"

import { ArticlePreviewGrid } from "./articles/ArticlePreviewGrid"
import { SectionTitle } from "./layout/SectionTitle"
import type { BrawlhallaArticle } from "@dair/api/src/services/brawlhalla-gql/brawlhalla-gql-service"

export const LandingArticles = ({ articles }: { articles: BrawlhallaArticle[] }) => {
	if (!articles || articles.length <= 0) return null

	return (
		<>
			<SectionTitle className="text-center mt-16">
				<Trans>Latest News</Trans>
			</SectionTitle>
			<ArticlePreviewGrid articles={articles} />
		</>
	)
}
