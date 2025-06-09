import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';

import { db } from '@/db';
import { getSession } from '@/features/auth/functions/getSession';

import { bookmarksInsertSchema, bookmarksTable } from '../schema/bookmarks';

export const addBookmark = createServerFn({ method: 'POST' })
  .validator(z.object({ bookmark: bookmarksInsertSchema }))
  .handler(async ({ data: { bookmark } }) => {
    // TODO: CRSF protection
    const session = await getSession();
    if (!session) {
      throw new Error('Unauthorized');
    }

    const { user } = session;

    const newBookmark = {
      ...bookmark,
      userId: user.id,
    };

    const bookmarkData = await db
      .insert(bookmarksTable)
      .values(newBookmark)
      .returning()
      .onConflictDoUpdate({
        set: {
          name: newBookmark.name,
        },
        target: [bookmarksTable.userId, bookmarksTable.pageId, bookmarksTable.pageType],
      })
      .execute();

    return bookmarkData[0] ?? newBookmark;
  });
