import { Database } from "@/services/db"
import {
  type Bookmark,
  type NewBookmark,
  type Provider,
  bookmarksTable,
  legacyBookmarksTable,
} from "@dair/db"
import { and, eq, sql } from "drizzle-orm"
import { Context, Effect, Layer } from "effect"
import { BookmarkError } from "./errors"

const mapBookmarkError = <A, E, R>(effect: Effect.Effect<A, E, R>) =>
  effect.pipe(
    Effect.mapError(
      (cause) =>
        new BookmarkError({
          message: "Bookmark database operation failed",
          cause,
        }),
    ),
  )

/**
 * Bookmarks service for managing user bookmarks
 */
type BookmarksService = {
  readonly getBookmarks: (
    userId: string,
  ) => Effect.Effect<ReadonlyArray<Bookmark>, BookmarkError>
  readonly addBookmark: (
    userId: string,
    bookmark: Omit<NewBookmark, "userId">,
  ) => Effect.Effect<Bookmark, BookmarkError>
  readonly getBookmarksByPageIds: (
    userId: string | undefined,
    bookmarks: ReadonlyArray<Pick<Bookmark, "pageId" | "pageType">>,
  ) => Effect.Effect<ReadonlyArray<Bookmark>, BookmarkError>
  readonly deleteBookmark: (
    userId: string,
    bookmark: Pick<Bookmark, "pageId" | "pageType">,
  ) => Effect.Effect<void, BookmarkError>
  readonly migrateLegacyBookmarks: (options: {
    readonly userId: string
    readonly provider: Provider
  }) => Effect.Effect<void, BookmarkError>
}

export class Bookmarks extends Context.Service<Bookmarks, BookmarksService>()(
  "@app/Bookmarks",
  {
    make: Effect.gen(function* () {
      const db = yield* Database

      const getBookmarks = Effect.fn("Bookmarks.getBookmarks")(function* (
        userId: string,
      ) {
        return yield* mapBookmarkError(
          db
            .select()
            .from(bookmarksTable)
            .where(eq(bookmarksTable.userId, userId)),
        )
      })

      const addBookmark = Effect.fn("Bookmarks.addBookmark")(function* (
        userId: string,
        bookmark: Omit<NewBookmark, "userId">,
      ) {
        const newBookmark: NewBookmark = {
          ...bookmark,
          userId,
        }

        const result = yield* mapBookmarkError(
          db
            .insert(bookmarksTable)
            .values(newBookmark)
            .returning()
            .onConflictDoUpdate({
              set: {
                name: newBookmark.name,
              },
              target: [
                bookmarksTable.userId,
                bookmarksTable.pageId,
                bookmarksTable.pageType,
              ],
            }),
        )

        if (!result[0]) {
          return yield* Effect.fail(
            new BookmarkError({
              message: `Failed to create bookmark for user ${userId}`,
            }),
          )
        }

        return result[0] as Bookmark
      })

      const getBookmarksByPageIds = Effect.fn(
        "Bookmarks.getBookmarksByPageIds",
      )(function* (
        userId: string | undefined,
        bookmarks: ReadonlyArray<Pick<Bookmark, "pageId" | "pageType">>,
      ) {
        if (!userId) {
          return yield* Effect.succeed([])
        }

        const bookmarksData = yield* mapBookmarkError(
          db
            .select()
            .from(bookmarksTable)
            .where(eq(bookmarksTable.userId, userId)),
        )

        return bookmarks
          .map((bookmark) => {
            const bookmarkData = bookmarksData.find(
              (b) =>
                b.pageId === bookmark.pageId &&
                b.pageType === bookmark.pageType,
            )

            if (!bookmarkData) return null

            return {
              ...bookmark,
              ...bookmarkData,
            } as Bookmark
          })
          .filter((b): b is Bookmark => b !== null)
      })

      const deleteBookmark = Effect.fn("Bookmarks.deleteBookmark")(function* (
        userId: string,
        bookmark: Pick<Bookmark, "pageId" | "pageType">,
      ) {
        yield* mapBookmarkError(
          db
            .delete(bookmarksTable)
            .where(
              and(
                eq(bookmarksTable.userId, userId),
                eq(bookmarksTable.pageId, bookmark.pageId),
                eq(bookmarksTable.pageType, bookmark.pageType),
              ),
            ),
        )
      })

      const migrateLegacyBookmarks = Effect.fn(
        "Bookmarks.migrateLegacyBookmarks",
      )(function* ({
        userId,
        provider,
      }: {
        userId: string
        provider: Provider
      }) {
        const oauthAccount = yield* mapBookmarkError(
          db.query.oauthAccountsTable.findFirst({
            where: {
              userId: { eq: userId },
              provider: { eq: provider },
            },
          }),
        )

        const providerUserId = oauthAccount?.providerUserId
        if (!providerUserId) {
          return
        }

        const legacyBookmarks = yield* mapBookmarkError(
          db
            .select()
            .from(legacyBookmarksTable)
            .where(
              and(
                eq(legacyBookmarksTable.provider, provider),
                eq(legacyBookmarksTable.providerUserId, providerUserId),
              ),
            ),
        )

        if (legacyBookmarks.length === 0) {
          return
        }

        yield* mapBookmarkError(
          db
            .insert(bookmarksTable)
            .values(
              legacyBookmarks.map(
                ({
                  provider: _provider,
                  providerUserId: _providerUserId,
                  ...bookmark
                }) => ({
                  ...bookmark,
                  userId,
                }),
              ),
            )
            .onConflictDoUpdate({
              set: {
                name: sql`excluded.name`,
              },
              target: [
                bookmarksTable.userId,
                bookmarksTable.pageId,
                bookmarksTable.pageType,
              ],
            }),
        )

        yield* mapBookmarkError(
          db
            .delete(legacyBookmarksTable)
            .where(
              and(
                eq(legacyBookmarksTable.provider, provider),
                eq(legacyBookmarksTable.providerUserId, providerUserId),
              ),
            ),
        )

        yield* Effect.log("Migrated legacy bookmarks to user", {
          userId,
          provider,
          count: legacyBookmarks.length,
        })
      })

      return {
        getBookmarks,
        addBookmark,
        getBookmarksByPageIds,
        deleteBookmark,
        migrateLegacyBookmarks,
      }
    }),
  },
) {
  static readonly layer = Layer.effect(this, this.make).pipe(
    Layer.provide(Database.layer),
  )
}
