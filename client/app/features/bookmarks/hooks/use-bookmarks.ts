import { queryOptions, useSuspenseQuery } from "@tanstack/react-query"

import { useAuth } from "@/features/auth/use-auth"

import type { BookmarksQuery } from "../functions/get-bookmarks"
import { getBookmarks } from "../functions/get-bookmarks"

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

  return bookmarks
}
