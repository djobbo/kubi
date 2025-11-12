import { Trans } from "@lingui/react/macro"

import type { GetPreviewArticlesResponse } from "@dair/api-contract/src/routes/v1/brawlhalla/get-preview-articles"
import { ArticlePreviewGrid } from "./articles/ArticlePreviewGrid"
import { SectionTitle } from "./layout/SectionTitle"

export const LandingArticles = ({
	articles,
}: { articles: (typeof GetPreviewArticlesResponse.Type)["data"] }) => {
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
