import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/features/auth/use-auth';

import { addBookmark } from '../functions/add-bookmark';
import { deleteBookmark } from '../functions/delete-bookmark';
import type { NewBookmark } from '../schema';

export const useToggleBookmark = (bookmark: NewBookmark) => {
  const { isLoggedIn, session } = useAuth();
  const queryClient = useQueryClient();

  const toggleBookmarkMutation = useMutation({
    mutationFn: async (isBookmarked: boolean) => {
      if (isBookmarked) {
        return await addBookmark({ data: { bookmark } });
      }

      return await deleteBookmark({
        data: { bookmark },
      });
    },
    onMutate: async (isBookmarked) => {
      await queryClient.cancelQueries({
        queryKey: [
          'is-bookmarked',
          isLoggedIn,
          session?.user.id,
          bookmark.pageId,
          bookmark.pageType,
        ],
      });

      const previousIsBookmarked = queryClient.getQueryData([
        'is-bookmarked',
        isLoggedIn,
        session?.user.id,
        bookmark.pageId,
        bookmark.pageType,
      ]);

      queryClient.setQueryData(
        ['is-bookmarked', isLoggedIn, session?.user.id, bookmark.pageId, bookmark.pageType],
        isBookmarked
      );

      return { previousIsBookmarked, isBookmarked };
    },
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(
        ['is-bookmarked', isLoggedIn, session?.user.id, bookmark.pageId, bookmark.pageType],
        context?.previousIsBookmarked ?? false
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [
          'is-bookmarked',
          isLoggedIn,
          session?.user.id,
          bookmark.pageId,
          bookmark.pageType,
        ],
      });
      queryClient.invalidateQueries({
        queryKey: ['bookmarks'],
      });
    },
  });

  return toggleBookmarkMutation;
};
