import { queryOptions } from "@tanstack/react-query"

import { useAuth } from "@/features/auth/use-auth"
import { useLazyQuery } from "@/hooks/use-lazy-query"

import { checkBookmarked } from "../functions/check-bookmarked"
import type { NewBookmark } from "../schema"

export const useIsBookmarked = (
  bookmark: NewBookmark,
  initialValue?: boolean,
) => {
  const { isLoggedIn, user } = useAuth()
  const { data: isBookmarked = false } = useLazyQuery(
    queryOptions({
      queryKey: [
        "is-bookmarked",
        isLoggedIn,
        user?.id,
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
      initialData: initialValue,
    }),
  )

  return isBookmarked
}
