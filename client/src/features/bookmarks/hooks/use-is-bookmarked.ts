import { queryOptions, useSuspenseQuery } from "@tanstack/react-query"

import { useAuth } from "@/features/auth/use-auth"

import type { NewBookmark } from "@dair/schema/src/bookmarks/bookmarks"
import { checkBookmarked } from "../functions/check-bookmarked"

export const useIsBookmarked = (
	bookmark: NewBookmark,
	initialValue?: boolean,
) => {
	const { isLoggedIn, session } = useAuth()
	const { data: isBookmarked = false } = useSuspenseQuery(
		queryOptions({
			queryKey: [
				"is-bookmarked",
				isLoggedIn,
				session?.user.id,
				bookmark.pageId,
				bookmark.pageType,
			],
			queryFn: async () => {
				if (!isLoggedIn) return false

				const isBookmarked = await checkBookmarked({
					data: {
						bookmark: {
							pageId: bookmark.pageId,
							pageType: bookmark.pageType,
						},
					},
				})
				return isBookmarked
			},
			...(initialValue !== undefined && { initialData: initialValue }),
		}),
	)

	return isBookmarked
}
