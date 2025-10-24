import { Trans } from "@lingui/react/macro"

import { ArticlePreviewGrid } from "./articles/ArticlePreviewGrid"
import { SectionTitle } from "./layout/SectionTitle"
import type { GetPreviewArticlesResponse } from '@dair/effect-ts/src/routes/brawlhalla/get-preview-articles/schema'

export const LandingArticles = ({
	articles,
}: { articles: typeof GetPreviewArticlesResponse.Type['data'] }) => {
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
