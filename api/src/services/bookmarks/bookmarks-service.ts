import {
	type Bookmark,
	DISCORD_PROVIDER_ID,
	type NewBookmark,
	bookmarksTable,
	legacyBookmarksTable,
} from "@dair/schema"
import { and, eq } from "drizzle-orm"
import { db } from "../../db"
import type { Session } from "../auth"

export const bookmarksService = {
	getBookmarks: async (userId: string) => {
		const bookmarks = await db
			.select()
			.from(bookmarksTable)
			.where(eq(bookmarksTable.userId, userId))
			.execute()
		return bookmarks
	},
	addBookmark: async (
		userId: string,
		bookmark: Omit<NewBookmark, "userId">,
	) => {
		const newBookmark: NewBookmark = {
			...bookmark,
			userId,
		}

		const bookmarkData = await db
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

		return bookmarkData[0] ?? newBookmark
	},
	getBookmarksByPageIds: async (
		userId: string | undefined,
		bookmarks: Pick<Bookmark, "pageId" | "pageType">[],
	) => {
		if (!userId) return []

		const bookmarksData = (
			await db.transaction(async (tx) => {
				return Promise.all(
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
			})
		).flat()

		return bookmarks.map((bookmark) => {
			const bookmarkData = bookmarksData.find(
				(b) => b.pageId === bookmark.pageId && b.pageType === bookmark.pageType,
			)

			if (!bookmarkData) return null

			return {
				...bookmark,
				...bookmarkData,
			}
		}).filter(b => b !== null)
	},
	deleteBookmark: async (
		userId: string,
		bookmark: Pick<Bookmark, "pageId" | "pageType">,
	) => {
		await db
			.delete(bookmarksTable)
			.where(
				and(
					eq(bookmarksTable.userId, userId),
					eq(bookmarksTable.pageId, bookmark.pageId),
					eq(bookmarksTable.pageType, bookmark.pageType),
				),
			)
			.execute()
	},
	migrateLegacyBookmarks: async ({ user }: Session) => {
		const discordId = user.oauthAccounts.find(
			(account) => account.provider === DISCORD_PROVIDER_ID,
		)?.providerUserId
		if (!discordId) {
			throw new Error("Discord account not found")
		}

		await db.transaction(async (tx) => {
			const legacyBookmarks = await tx
				.select()
				.from(legacyBookmarksTable)
				.where(eq(legacyBookmarksTable.discordId, discordId))
				.execute()

			await tx
				.insert(bookmarksTable)
				.values(
					legacyBookmarks.map(({ discordId, ...bookmark }) => ({
						...bookmark,
						userId: user.id,
					})),
				)
				.execute()

			await tx
				.delete(legacyBookmarksTable)
				.where(eq(legacyBookmarksTable.discordId, discordId))
				.execute()
		})
	},
}
