import { DB } from "@/services/db"
import type { SessionWithUser } from "@/services/authorization"
import {
  type Bookmark,
  DISCORD_PROVIDER_ID,
  type NewBookmark,
  bookmarksTable,
  legacyBookmarksTable,
} from "@dair/schema"
import { and, eq } from "drizzle-orm"
import { Context, Effect, Layer } from "effect"
import { BookmarkError, DiscordAccountNotFoundError } from "./errors"

/**
 * Bookmarks service for managing user bookmarks
 */
export class Bookmarks extends Context.Tag("@app/Bookmarks")<
  Bookmarks,
  {
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
>() {
  /**
   * Live layer for Bookmarks service
   */
  static readonly layer = Layer.effect(
    Bookmarks,
    Effect.gen(function* () {
      const db = yield* DB

      const getBookmarks = Effect.fn("Bookmarks.getBookmarks")(function* (
        userId: string,
      ) {
        return yield* db
          .use(async (client) => {
            return await client
              .select()
              .from(bookmarksTable)
              .where(eq(bookmarksTable.userId, userId))
              .execute()
          })
          .pipe(
            Effect.catchTag("DBQueryError", (error) =>
              Effect.fail(
                new BookmarkError({
                  message: `Failed to get bookmarks for user ${userId}`,
                  cause: error,
                }),
              ),
            ),
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

        const result = yield* db
          .use(async (client) => {
            return await client
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
              })
              .execute()
          })
          .pipe(
            Effect.catchTag("DBQueryError", (error) =>
              Effect.fail(
                new BookmarkError({
                  message: `Failed to add bookmark for user ${userId}`,
                  cause: error,
                }),
              ),
            ),
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

        const bookmarksData = yield* db
          .use(async (client) => {
            return await client.transaction(async (tx) => {
              const results = await Promise.all(
                bookmarks.map((bookmark) =>
                  tx
                    .select()
                    .from(bookmarksTable)
                    .where(
                      and(
                        eq(bookmarksTable.userId, userId),
                        eq(bookmarksTable.pageId, bookmark.pageId),
                        eq(bookmarksTable.pageType, bookmark.pageType),
                      ),
                    )
                    .execute(),
                ),
              )
              return results.flat()
            })
          })
          .pipe(
            Effect.catchTag("DBQueryError", (error) =>
              Effect.fail(
                new BookmarkError({
                  message: `Failed to get bookmarks by page IDs for user ${userId}`,
                  cause: error,
                }),
              ),
            ),
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
        yield* db
          .use(async (client) => {
            await client
              .delete(bookmarksTable)
              .where(
                and(
                  eq(bookmarksTable.userId, userId),
                  eq(bookmarksTable.pageId, bookmark.pageId),
                  eq(bookmarksTable.pageType, bookmark.pageType),
                ),
              )
              .execute()
          })
          .pipe(
            Effect.catchTag("DBQueryError", (error) =>
              Effect.fail(
                new BookmarkError({
                  message: `Failed to delete bookmark for user ${userId}`,
                  cause: error,
                }),
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

        yield* db
          .use(async (client) => {
            await client.transaction(async (tx) => {
              const legacyBookmarks = await tx
                .select()
                .from(legacyBookmarksTable)
                .where(eq(legacyBookmarksTable.discordId, discordId))
                .execute()

              if (legacyBookmarks.length > 0) {
                await tx
                  .insert(bookmarksTable)
                  .values(
                    legacyBookmarks.map(({ discordId: _, ...bookmark }) => ({
                      ...bookmark,
                      userId: session.user.id,
                    })),
                  )
                  .execute()

                await tx
                  .delete(legacyBookmarksTable)
                  .where(eq(legacyBookmarksTable.discordId, discordId))
                  .execute()
              }
            })
          })
          .pipe(
            Effect.catchTag("DBQueryError", (error) =>
              Effect.fail(
                new BookmarkError({
                  message: `Failed to migrate legacy bookmarks for user ${session.user.id}`,
                  cause: error,
                }),
              ),
            ),
          )
      })

      return Bookmarks.of({
        getBookmarks,
        addBookmark,
        getBookmarksByPageIds,
        deleteBookmark,
        migrateLegacyBookmarks,
      })
    }),
  ).pipe(Layer.provide(DB.layer))
}
