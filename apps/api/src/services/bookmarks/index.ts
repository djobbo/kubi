import { Database } from "@/services/db"
import type { SessionWithUser } from "@/services/authorization"
import {
  type Bookmark,
  DISCORD_PROVIDER_ID,
  type NewBookmark,
  bookmarksTable,
  legacyBookmarksTable,
} from "@dair/db"
import { and, eq } from "drizzle-orm"
import { Context, Effect, Layer } from "effect"
import { BookmarkError, DiscordAccountNotFoundError } from "./errors"

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
  readonly migrateLegacyBookmarks: (
    session: SessionWithUser,
  ) => Effect.Effect<void, BookmarkError | DiscordAccountNotFoundError>
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
      )(function* (session: SessionWithUser) {
        const oauthAccounts = session.user.oauthAccounts as ReadonlyArray<{
          provider: string
          providerUserId: string
        }>
        const discordAccount = oauthAccounts.find(
          (account) => account.provider === DISCORD_PROVIDER_ID,
        )
        const discordId = discordAccount?.providerUserId

        if (!discordId) {
          return yield* Effect.fail(
            new DiscordAccountNotFoundError({
              userId: session.user.id,
            }),
          )
        }

        const legacyBookmarks = yield* mapBookmarkError(
          db
            .select()
            .from(legacyBookmarksTable)
            .where(eq(legacyBookmarksTable.discordId, discordId)),
        )

        if (legacyBookmarks.length > 0) {
          yield* mapBookmarkError(
            db.insert(bookmarksTable).values(
              legacyBookmarks.map(({ discordId: _discordId, ...bookmark }) => ({
                ...bookmark,
                userId: session.user.id,
              })),
            ),
          )

          yield* mapBookmarkError(
            db
              .delete(legacyBookmarksTable)
              .where(eq(legacyBookmarksTable.discordId, discordId)),
          )
        }
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
