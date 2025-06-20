import { Hono } from "hono"
import { resolver } from "hono-openapi/zod"
import { z } from "zod"
import {
	contentlessResponse,
	describeRoute,
	jsonErrorResponse,
	jsonResponse,
} from "../../helpers/describe-route"
import { authMiddleware } from "../../middlewares/auth-middleware"
import { bookmarksService } from "../../services/bookmarks/bookmarks-service"

export const bookmarksRoute = new Hono()
	// GET /bookmarks - Get all bookmarks for the authenticated user
	.get(
		"/",
		describeRoute({
			description: "Get all bookmarks for the authenticated user",
			summary: "Get all bookmarks for the authenticated user",
			tags: ["Bookmarks"],
			responses: {
				200: jsonResponse(
					"Bookmarks retrieved successfully",
					z.object({
						data: z.array(z.any()),
						meta: z.object({
							count: z.number(),
							timestamp: z.string(),
						}),
					}),
				),
				500: jsonErrorResponse("Failed to fetch bookmarks", [
					"FETCH_BOOKMARKS_FAILED",
				] as const),
			},
		}),
		authMiddleware,
		async (c) => {
			try {
				const session = c.get("session")
				const bookmarks = await bookmarksService.getBookmarks(session.user.id)

				return c.json[200]({
					data: bookmarks,
					meta: {
						count: bookmarks.length,
						timestamp: new Date().toISOString(),
					},
				})
			} catch (error) {
				console.error("Error fetching bookmarks:", error)
				return c.json[500]({
					error: {
						code: "FETCH_BOOKMARKS_FAILED",
						message: "Failed to fetch bookmarks",
						details: ["An error occurred while retrieving bookmarks"],
					},
				})
			}
		},
	)
	// GET /bookmarks/:pageType/:pageId - Get a specific bookmark
	.get(
		"/:pageType/:pageId",
		describeRoute({
			description: "Get a specific bookmark by page type and page ID",
			summary: "Get a specific bookmark by page type and page ID",
			tags: ["Bookmarks"],
			responses: {
				200: jsonResponse(
					"Bookmark retrieved successfully",
					z.object({
						data: z.any(),
						meta: z.object({
							timestamp: z.string(),
						}),
					}),
				),
				400: jsonErrorResponse("Invalid page type", [
					"INVALID_PAGE_TYPE",
				] as const),
				404: jsonErrorResponse("Bookmark not found", [
					"BOOKMARK_NOT_FOUND",
				] as const),
				500: jsonErrorResponse("Failed to fetch bookmark", [
					"FETCH_BOOKMARK_FAILED",
				] as const),
			},
		}),
		authMiddleware,
		async (c) => {
			try {
				const session = c.get("session")
				const { pageId, pageType } = c.req.param()

				// Validate pageType
				if (pageType !== "player_stats" && pageType !== "clan_stats") {
					return c.json[400]({
						error: {
							code: "INVALID_PAGE_TYPE",
							message: "Invalid page type",
							details: [
								`Page type '${pageType}' is not supported. Supported types: player_stats, clan_stats`,
							],
						},
					})
				}

				const [bookmark] = await bookmarksService.getBookmarksByPageIds(
					session?.user.id,
					[{ pageId, pageType: pageType as "player_stats" | "clan_stats" }],
				)

				if (!bookmark) {
					return c.json[404]({
						error: {
							code: "BOOKMARK_NOT_FOUND",
							message: "Bookmark not found",
							details: [
								`No bookmark found for page type '${pageType}' with ID '${pageId}'`,
							],
						},
					})
				}

				return c.json[200]({
					data: bookmark,
					meta: {
						timestamp: new Date().toISOString(),
					},
				})
			} catch (error) {
				console.error("Error fetching bookmark:", error)
				return c.json[500]({
					error: {
						code: "FETCH_BOOKMARK_FAILED",
						message: "Failed to fetch bookmark",
						details: ["An error occurred while retrieving the bookmark"],
					},
				})
			}
		},
	)
	// POST /bookmarks - Create a new bookmark
	.post(
		"/",
		describeRoute({
			description: "Create a new bookmark",
			summary: "Create a new bookmark",
			tags: ["Bookmarks"],
			responses: {
				201: jsonResponse(
					"Bookmark created successfully",
					z.object({
						data: z.any(),
						meta: z.object({
							timestamp: z.string(),
						}),
					}),
				),
				400: jsonErrorResponse("Missing required fields or invalid page type", [
					"VALIDATION_FAILED",
					"INVALID_PAGE_TYPE",
				] as const),
				500: jsonErrorResponse("Failed to create bookmark", [
					"CREATE_BOOKMARK_FAILED",
				] as const),
			},
		}),
		authMiddleware,
		async (c) => {
			try {
				const session = c.get("session")
				const { pageId, pageType, name, meta } = await c.req.json()

				// Validate required fields
				if (!pageId || !pageType) {
					return c.json[400]({
						error: {
							code: "VALIDATION_FAILED",
							message: "Missing required fields",
							details: ["pageId and pageType are required"],
						},
					})
				}

				// Validate pageType
				if (pageType !== "player_stats" && pageType !== "clan_stats") {
					return c.json[400]({
						error: {
							code: "INVALID_PAGE_TYPE",
							message: "Invalid page type",
							details: [
								`Page type '${pageType}' is not supported. Supported types: player_stats, clan_stats`,
							],
						},
					})
				}

				const bookmark = await bookmarksService.addBookmark(session.user.id, {
					pageId,
					pageType: pageType as "player_stats" | "clan_stats",
					name,
					meta,
				})

				return c.json[201]({
					data: bookmark,
					meta: {
						timestamp: new Date().toISOString(),
					},
				})
			} catch (error) {
				console.error("Error creating bookmark:", error)
				return c.json[500]({
					error: {
						code: "CREATE_BOOKMARK_FAILED",
						message: "Failed to create bookmark",
						details: ["An error occurred while creating the bookmark"],
					},
				})
			}
		},
	)
	// PUT /bookmarks/:pageType/:pageId - Update a bookmark
	.put(
		"/:pageType/:pageId",
		describeRoute({
			description: "Update an existing bookmark",
			summary: "Update an existing bookmark",
			tags: ["Bookmarks"],
			responses: {
				200: jsonResponse(
					"Bookmark updated successfully",
					z.object({
						data: z.any(),
						meta: z.object({
							timestamp: z.string(),
						}),
					}),
				),
				400: jsonErrorResponse("Invalid page type", [
					"INVALID_PAGE_TYPE",
				] as const),
				404: jsonErrorResponse("Bookmark not found", [
					"BOOKMARK_NOT_FOUND",
				] as const),
				500: jsonErrorResponse("Failed to update bookmark", [
					"UPDATE_BOOKMARK_FAILED",
				] as const),
			},
		}),
		authMiddleware,
		async (c) => {
			try {
				const session = c.get("session")
				const { pageId, pageType } = c.req.param()
				const { name, meta } = await c.req.json()

				// Validate pageType
				if (pageType !== "player_stats" && pageType !== "clan_stats") {
					return c.json[400]({
						error: {
							code: "INVALID_PAGE_TYPE",
							message: "Invalid page type",
							details: [
								`Page type '${pageType}' is not supported. Supported types: player_stats, clan_stats`,
							],
						},
					})
				}

				// Check if bookmark exists
				const [existingBookmark] = await bookmarksService.getBookmarksByPageIds(
					session?.user.id,
					[{ pageId, pageType: pageType as "player_stats" | "clan_stats" }],
				)

				if (!existingBookmark) {
					return c.json[404]({
						error: {
							code: "BOOKMARK_NOT_FOUND",
							message: "Bookmark not found",
							details: [
								`No bookmark found for page type '${pageType}' with ID '${pageId}'`,
							],
						},
					})
				}

				// Delete existing and create new (simplified update)
				await bookmarksService.deleteBookmark(session.user.id, {
					pageId,
					pageType: pageType as "player_stats" | "clan_stats",
				})
				const bookmark = await bookmarksService.addBookmark(session.user.id, {
					pageId,
					pageType: pageType as "player_stats" | "clan_stats",
					name,
					meta,
				})

				return c.json[200]({
					data: bookmark,
					meta: {
						timestamp: new Date().toISOString(),
					},
				})
			} catch (error) {
				console.error("Error updating bookmark:", error)
				return c.json[500]({
					error: {
						code: "UPDATE_BOOKMARK_FAILED",
						message: "Failed to update bookmark",
						details: ["An error occurred while updating the bookmark"],
					},
				})
			}
		},
	)
	// DELETE /bookmarks/:pageType/:pageId - Delete a bookmark
	.delete(
		"/:pageType/:pageId",
		describeRoute({
			description: "Delete a bookmark",
			summary: "Delete a bookmark",
			tags: ["Bookmarks"],
			responses: {
				400: jsonErrorResponse("Invalid page type", [
					"INVALID_PAGE_TYPE",
				] as const),
				404: jsonErrorResponse("Bookmark not found", [
					"BOOKMARK_NOT_FOUND",
				] as const),
				500: jsonErrorResponse("Failed to delete bookmark", [
					"DELETE_BOOKMARK_FAILED",
				] as const),
			},
			contentless: {
				204: contentlessResponse("Bookmark deleted successfully"),
			},
		}),
		authMiddleware,
		async (c) => {
			try {
				const session = c.get("session")
				const { pageId, pageType } = c.req.param()

				// Validate pageType
				if (pageType !== "player_stats" && pageType !== "clan_stats") {
					return c.json[400]({
						error: {
							code: "INVALID_PAGE_TYPE",
							message: "Invalid page type",
							details: [
								`Page type '${pageType}' is not supported. Supported types: player_stats, clan_stats`,
							],
						},
					})
				}

				// Check if bookmark exists
				const [existingBookmark] = await bookmarksService.getBookmarksByPageIds(
					session?.user.id,
					[{ pageId, pageType: pageType as "player_stats" | "clan_stats" }],
				)

				if (!existingBookmark) {
					return c.json[404]({
						error: {
							code: "BOOKMARK_NOT_FOUND",
							message: "Bookmark not found",
							details: [
								`No bookmark found for page type '${pageType}' with ID '${pageId}'`,
							],
						},
					})
				}

				await bookmarksService.deleteBookmark(session.user.id, {
					pageId,
					pageType: pageType as "player_stats" | "clan_stats",
				})
				return c.status(204)
			} catch (error) {
				console.error("Error deleting bookmark:", error)
				return c.json[500]({
					error: {
						code: "DELETE_BOOKMARK_FAILED",
						message: "Failed to delete bookmark",
						details: ["An error occurred while deleting the bookmark"],
					},
				})
			}
		},
	)
	// POST /bookmarks/migrate - Migrate legacy bookmarks
	.post(
		"/migrate",
		describeRoute({
			description: "Migrate legacy bookmarks to new format",
			summary: "Migrate legacy bookmarks to new format",
			tags: ["Bookmarks"],
			responses: {
				201: jsonResponse(
					"Legacy bookmarks migrated successfully",
					z.object({
						data: z.object({
							message: z.string(),
						}),
						meta: z.object({
							timestamp: z.string(),
						}),
					}),
				),
				500: jsonErrorResponse("Failed to migrate bookmarks", [
					"MIGRATION_FAILED",
				] as const),
			},
		}),
		authMiddleware,
		async (c) => {
			try {
				const session = c.get("session")
				await bookmarksService.migrateLegacyBookmarks(session)

				return c.json[201]({
					data: { message: "Legacy bookmarks migrated successfully" },
					meta: {
						timestamp: new Date().toISOString(),
					},
				})
			} catch (error) {
				console.error("Error migrating bookmarks:", error)
				return c.json[500]({
					error: {
						code: "MIGRATION_FAILED",
						message: "Failed to migrate legacy bookmarks",
						details: ["An error occurred while migrating legacy bookmarks"],
					},
				})
			}
		},
	)
