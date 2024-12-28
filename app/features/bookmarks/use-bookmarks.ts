import { queryOptions, useSuspenseQuery } from "@tanstack/react-query"

import { useAuth } from "@/features/auth/use-auth"

import { addBookmark } from "./functions/add-bookmark"
import { deleteBookmark } from "./functions/delete-bookmark"
import type { BookmarksQuery } from "./functions/get-bookmarks"
import { getBookmarks } from "./functions/get-bookmarks"
import type { Bookmark } from "./schema"

export const useBookmarks = (query: BookmarksQuery = {}) => {
  const { isLoggedIn } = useAuth()
  const { data: bookmarks } = useSuspenseQuery(
    queryOptions({
      queryKey: ["bookmarks", isLoggedIn, query],
      queryFn: async () => {
        if (!isLoggedIn) return []

        const bookmarks = await getBookmarks({
          data: { query },
        })
        return bookmarks
      },
    }),
  )

  return {
    bookmarks,
    addBookmark,
    deleteBookmark,
    isBookmarked: (bookmark: Bookmark) => {
      // TODO: Implement isBookmarked
      throw new Error("Not implemented")
    },
  }
}
