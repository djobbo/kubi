import { queryOptions, useSuspenseQuery } from "@tanstack/react-query"
import { useRootContext } from "@/hooks/use-root-context"

export const useBookmarks = () => {
	const { session, apiClient } = useRootContext()
	const { data: bookmarks } = useSuspenseQuery(
		queryOptions({
			queryKey: ["bookmarks", session?.user.id],
			queryFn: async () => {
				if (!session) return []

				const {bookmarks} = await apiClient.bookmarks.getBookmarks()
					.then((res) => res.json())
				return bookmarks
			},
			initialData: session?.user.bookmarks,
		}),
	)

	return bookmarks
}
