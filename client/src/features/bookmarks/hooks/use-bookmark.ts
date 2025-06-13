import { useMutation } from "@tanstack/react-query"
import { useRootContext } from "@/hooks/use-root-context"
import type { NewBookmark } from "@dair/schema"
import { useBookmarks } from "./use-bookmarks"
import { useRouter } from '@tanstack/react-router'

export const useBookmark = (
	pageId: NewBookmark["pageId"],
	pageType: NewBookmark["pageType"],
) => {
	const {apiClient, session, queryClient} = useRootContext()
	const bookmarks = useBookmarks()
	const bookmark = bookmarks.find(b => b.pageId === pageId && b.pageType === pageType)
	const router = useRouter()

	const toggleBookmarkMutation = useMutation({
		mutationFn: async (shouldAddBookmark: boolean) => {
			if (shouldAddBookmark) {
				return await apiClient.bookmarks.addBookmark({
					param: { pageId, pageType },
					json: { name, meta },
				})
			}

			return await apiClient.bookmarks.deleteBookmark({
				param: { pageId, pageType },
			})
		},
		onMutate: async (shouldAddBookmark) => {
			await queryClient.cancelQueries({
				queryKey: [
					"bookmark",
					session?.user.id,
					pageId,
					pageType,
				],
			})

			const previousIsBookmarked = queryClient.getQueryData([
				"bookmark",
				session?.user.id,
				pageId,
				pageType,
			])

			queryClient.setQueryData(
				[
					"bookmark",
					session?.user.id,
					pageId,
					pageType,
				],
				shouldAddBookmark,
			)

			return { previousIsBookmarked, shouldAddBookmark }
		},
		onError: (err, shouldAddBookmark, context) => {
			queryClient.setQueryData(
				[
					"bookmark",
					session?.user.id,
					pageId,
					pageType,
				],
				context?.previousIsBookmarked ?? false,
			)
		},
		onSettled: () => {
			router.invalidate()
		},
	})

	return {
		bookmark,
		toggleBookmark: toggleBookmarkMutation.mutate,
	}
}
