import type { NewBookmark } from '../schema';
import { useIsBookmarked } from './use-is-bookmarked';
import { useToggleBookmark } from './use-toggle-bookmark';

export const useBookmark = (bookmark: NewBookmark, initialIsBookmarked?: boolean) => {
  const isBookmarked = useIsBookmarked(bookmark, initialIsBookmarked);
  const toggleBookmarkMutation = useToggleBookmark(bookmark);

  return {
    isBookmarked,
    toggleBookmark: toggleBookmarkMutation.mutate,
    addBookmark: () => toggleBookmarkMutation.mutate(true),
    deleteBookmark: () => toggleBookmarkMutation.mutate(false),
  };
};
