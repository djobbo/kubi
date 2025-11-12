import HttpStatus from "@/helpers/http-status"
import { jsonContent, jsonContentRequired } from "@/helpers/json-content"
import { authMiddleware } from "@/middlewares/auth-middleware"
import { bookmarksService } from "@/services/bookmarks/bookmarks-service"
import { OpenAPIHono as Hono, createRoute, z } from "@hono/zod-openapi"

export const bookmarksRoute = new Hono()
	// GET /bookmarks - Get all bookmarks for the authenticated user
	.openapi(
		createRoute({
			method: "get",
			path: "/",
			description: "Get all bookmarks for the authenticated user",
			summary: "Get all bookmarks for the authenticated user",
			tags: ["Bookmarks"],
			responses: {
				[HttpStatus.OK]: jsonContent(
					z.object({
						data: z.array(z.any()),
						meta: z.object({
							count: z.number(),
							timestamp: z.string(),
						}),
					}),
					"Bookmarks retrieved successfully",
				),
				[HttpStatus.INTERNAL_SERVER_ERROR]: jsonContent(
					z.object({
						error: z.object({
							code: z.string(),
							message: z.string(),
							details: z.array(z.string()),
						}),
					}),
					"Failed to fetch bookmarks",
				),
			},
			middleware: authMiddleware,
		}),
		async (c) => {
			try {
				const session = c.get("session")
				const bookmarks = await bookmarksService.getBookmarks(session.user.id)

				return c.json(
					{
						data: bookmarks,
						meta: {
							count: bookmarks.length,
							timestamp: new Date().toISOString(),
						},
					},
					HttpStatus.OK,
				)
			} catch (error) {
				console.error("Error fetching bookmarks:", error)
				return c.json(
					{
						error: {
							code: "FETCH_BOOKMARKS_FAILED" as const,
							message: "Failed to fetch bookmarks",
							details: ["An error occurred while retrieving bookmarks"],
						},
					},
					HttpStatus.INTERNAL_SERVER_ERROR,
				)
			}
		},
	)
	// GET /bookmarks/:pageType/:pageId - Get a specific bookmark
	.openapi(
		createRoute({
			method: "get",
			path: "/{pageType}/{pageId}",
			description: "Get a specific bookmark by page type and page ID",
			summary: "Get a specific bookmark by page type and page ID",
			tags: ["Bookmarks"],
			request: {
				params: z.object({
					pageType: z.enum(["player_stats", "clan_stats"]),
					pageId: z.string(),
				}),
			},
			responses: {
				[HttpStatus.OK]: jsonContent(
					z.object({
						data: z.any(),
						meta: z.object({
							timestamp: z.string(),
						}),
					}),
					"Bookmark retrieved successfully",
				),
				[HttpStatus.BAD_REQUEST]: jsonContent(
					z.object({
						error: z.object({
							code: z.string(),
							message: z.string(),
							details: z.array(z.string()),
						}),
					}),
					"Invalid page type",
				),
				[HttpStatus.UNAUTHORIZED]: jsonContent(
					z.object({
						error: z.object({
							code: z.string(),
							message: z.string(),
							details: z.array(z.string()),
						}),
					}),
					"Unauthorized",
				),
				[HttpStatus.NOT_FOUND]: jsonContent(
					z.object({
						error: z.object({
							code: z.string(),
							message: z.string(),
							details: z.array(z.string()),
						}),
					}),
					"Bookmark not found",
				),
				[HttpStatus.INTERNAL_SERVER_ERROR]: jsonContent(
					z.object({
						error: z.object({
							code: z.string(),
							message: z.string(),
							details: z.array(z.string()),
						}),
					}),
					"Failed to fetch bookmark",
				),
			},
			middleware: authMiddleware,
		}),
		async (c) => {
			try {
				const session = c.get("session")
				const { pageId, pageType } = c.req.valid("param")

				const [bookmark] = await bookmarksService.getBookmarksByPageIds(
					session?.user.id,
					[{ pageId, pageType: pageType as "player_stats" | "clan_stats" }],
				)

				if (!bookmark) {
					return c.json(
						{
							error: {
								code: "BOOKMARK_NOT_FOUND" as const,
								message: "Bookmark not found",
								details: [
									`No bookmark found for page type '${pageType}' with ID '${pageId}'`,
								],
							},
						},
						HttpStatus.NOT_FOUND,
					)
				}

				return c.json(
					{
						data: bookmark,
						meta: {
							timestamp: new Date().toISOString(),
						},
					},
					HttpStatus.OK,
				)
			} catch (error) {
				console.error("Error fetching bookmark:", error)
				return c.json(
					{
						error: {
							code: "FETCH_BOOKMARK_FAILED" as const,
							message: "Failed to fetch bookmark",
							details: ["An error occurred while retrieving the bookmark"],
						},
					},
					HttpStatus.INTERNAL_SERVER_ERROR,
				)
			}
		},
	)
	// POST /bookmarks - Create a new bookmark
	.openapi(
		createRoute({
			method: "post",
			path: "/",
			description: "Create a new bookmark",
			summary: "Create a new bookmark",
			tags: ["Bookmarks"],
			request: {
				body: jsonContentRequired(
					z.object({
						pageId: z.string(),
						pageType: z.enum(["player_stats", "clan_stats"]),
						name: z.string(),
						meta: z.any(),
					}),
					"Bookmark creation request",
				),
			},
			responses: {
				[HttpStatus.CREATED]: jsonContent(
					z.object({
						data: z.any(),
						meta: z.object({
							timestamp: z.string(),
						}),
					}),
					"Bookmark created successfully",
				),
				[HttpStatus.BAD_REQUEST]: jsonContent(
					z.object({
						error: z.object({
							code: z.string(),
							message: z.string(),
							details: z.array(z.string()),
						}),
					}),
					"Missing required fields or invalid page type",
				),
				[HttpStatus.UNAUTHORIZED]: jsonContent(
					z.object({
						error: z.object({
							code: z.string(),
							message: z.string(),
							details: z.array(z.string()),
						}),
					}),
					"Unauthorized",
				),
				[HttpStatus.INTERNAL_SERVER_ERROR]: jsonContent(
					z.object({
						error: z.object({
							code: z.string(),
							message: z.string(),
							details: z.array(z.string()),
						}),
					}),
					"Failed to create bookmark",
				),
			},
			middleware: authMiddleware,
		}),
		async (c) => {
			try {
				const session = c.get("session")
				const { pageId, pageType, name, meta } = c.req.valid("json")

				// Validate pageType
				if (pageType !== "player_stats" && pageType !== "clan_stats") {
					return c.json(
						{
							error: {
								code: "INVALID_PAGE_TYPE" as const,
								message: "Invalid page type",
								details: [
									`Page type '${pageType}' is not supported. Supported types: player_stats, clan_stats`,
								],
							},
						},
						HttpStatus.BAD_REQUEST,
					)
				}

				const bookmark = await bookmarksService.addBookmark(session.user.id, {
					pageId,
					pageType: pageType as "player_stats" | "clan_stats",
					name,
					meta,
				})

				return c.json(
					{
						data: bookmark,
						meta: {
							timestamp: new Date().toISOString(),
						},
					},
					HttpStatus.CREATED,
				)
			} catch (error) {
				console.error("Error creating bookmark:", error)
				return c.json(
					{
						error: {
							code: "CREATE_BOOKMARK_FAILED" as const,
							message: "Failed to create bookmark",
							details: ["An error occurred while creating the bookmark"],
						},
					},
					HttpStatus.INTERNAL_SERVER_ERROR,
				)
			}
		},
	)
	// PUT /bookmarks/:pageType/:pageId - Update a bookmark
	.openapi(
		createRoute({
			method: "put",
			path: "/{pageType}/{pageId}",
			description: "Update an existing bookmark",
			summary: "Update an existing bookmark",
			tags: ["Bookmarks"],
			request: {
				params: z.object({
					pageType: z.enum(["player_stats", "clan_stats"]),
					pageId: z.string(),
				}),
				body: jsonContentRequired(
					z.object({
						name: z.string(),
						meta: z.any(),
					}),
					"Bookmark update request",
				),
			},
			responses: {
				[HttpStatus.OK]: jsonContent(
					z.object({
						data: z.any(),
						meta: z.object({
							timestamp: z.string(),
						}),
					}),
					"Bookmark updated successfully",
				),
				[HttpStatus.BAD_REQUEST]: jsonContent(
					z.object({
						error: z.object({
							code: z.string(),
							message: z.string(),
							details: z.array(z.string()),
						}),
					}),
					"Invalid page type",
				),
				[HttpStatus.UNAUTHORIZED]: jsonContent(
					z.object({
						error: z.object({
							code: z.string(),
							message: z.string(),
							details: z.array(z.string()),
						}),
					}),
					"Unauthorized",
				),
				[HttpStatus.NOT_FOUND]: jsonContent(
					z.object({
						error: z.object({
							code: z.string(),
							message: z.string(),
							details: z.array(z.string()),
						}),
					}),
					"Bookmark not found",
				),
				[HttpStatus.INTERNAL_SERVER_ERROR]: jsonContent(
					z.object({
						error: z.object({
							code: z.string(),
							message: z.string(),
							details: z.array(z.string()),
						}),
					}),
					"Failed to update bookmark",
				),
			},
			middleware: authMiddleware,
		}),
		async (c) => {
			try {
				const session = c.get("session")
				const { pageId, pageType } = c.req.valid("param")
				const { name, meta } = c.req.valid("json")

				// Validate pageType
				if (pageType !== "player_stats" && pageType !== "clan_stats") {
					return c.json(
						{
							error: {
								code: "INVALID_PAGE_TYPE" as const,
								message: "Invalid page type",
								details: [
									`Page type '${pageType}' is not supported. Supported types: player_stats, clan_stats`,
								],
							},
						},
						HttpStatus.BAD_REQUEST,
					)
				}

				// Check if bookmark exists
				const [existingBookmark] = await bookmarksService.getBookmarksByPageIds(
					session?.user.id,
					[{ pageId, pageType: pageType as "player_stats" | "clan_stats" }],
				)

				if (!existingBookmark) {
					return c.json(
						{
							error: {
								code: "BOOKMARK_NOT_FOUND" as const,
								message: "Bookmark not found",
								details: [
									`No bookmark found for page type '${pageType}' with ID '${pageId}'`,
								],
							},
						},
						HttpStatus.NOT_FOUND,
					)
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

				return c.json(
					{
						data: bookmark,
						meta: {
							timestamp: new Date().toISOString(),
						},
					},
					HttpStatus.OK,
				)
			} catch (error) {
				console.error("Error updating bookmark:", error)
				return c.json(
					{
						error: {
							code: "UPDATE_BOOKMARK_FAILED" as const,
							message: "Failed to update bookmark",
							details: ["An error occurred while updating the bookmark"],
						},
					},
					HttpStatus.INTERNAL_SERVER_ERROR,
				)
			}
		},
	)
	// DELETE /bookmarks/:pageType/:pageId - Delete a bookmark
	.openapi(
		createRoute({
			method: "delete",
			path: "/{pageType}/{pageId}",
			description: "Delete a bookmark",
			summary: "Delete a bookmark",
			tags: ["Bookmarks"],
			request: {
				params: z.object({
					pageType: z.enum(["player_stats", "clan_stats"]),
					pageId: z.string(),
				}),
			},
			responses: {
				[HttpStatus.BAD_REQUEST]: jsonContent(
					z.object({
						error: z.object({
							code: z.string(),
							message: z.string(),
							details: z.array(z.string()),
						}),
					}),
					"Invalid page type",
				),
				[HttpStatus.UNAUTHORIZED]: jsonContent(
					z.object({
						error: z.object({
							code: z.string(),
							message: z.string(),
							details: z.array(z.string()),
						}),
					}),
					"Unauthorized",
				),
				[HttpStatus.NOT_FOUND]: jsonContent(
					z.object({
						error: z.object({
							code: z.string(),
							message: z.string(),
							details: z.array(z.string()),
						}),
					}),
					"Bookmark not found",
				),
				[HttpStatus.INTERNAL_SERVER_ERROR]: jsonContent(
					z.object({
						error: z.object({
							code: z.string(),
							message: z.string(),
							details: z.array(z.string()),
						}),
					}),
					"Failed to delete bookmark",
				),
				[HttpStatus.OK]: jsonContent(
					z.object({
						data: z.object({
							message: z.string(),
						}),
					}),
					"Bookmark deleted successfully",
				),
			},
			middleware: authMiddleware,
		}),
		async (c) => {
			try {
				const session = c.get("session")
				const { pageId, pageType } = c.req.param()

				// Validate pageType
				if (pageType !== "player_stats" && pageType !== "clan_stats") {
					return c.json(
						{
							error: {
								code: "INVALID_PAGE_TYPE" as const,
								message: "Invalid page type",
								details: [
									`Page type '${pageType}' is not supported. Supported types: player_stats, clan_stats`,
								],
							},
						},
						HttpStatus.BAD_REQUEST,
					)
				}

				// Check if bookmark exists
				const [existingBookmark] = await bookmarksService.getBookmarksByPageIds(
					session?.user.id,
					[{ pageId, pageType: pageType as "player_stats" | "clan_stats" }],
				)

				if (!existingBookmark) {
					return c.json(
						{
							error: {
								code: "BOOKMARK_NOT_FOUND" as const,
								message: "Bookmark not found",
								details: [
									`No bookmark found for page type '${pageType}' with ID '${pageId}'`,
								],
							},
						},
						HttpStatus.NOT_FOUND,
					)
				}

				await bookmarksService.deleteBookmark(session.user.id, {
					pageId,
					pageType: pageType as "player_stats" | "clan_stats",
				})
				return c.json(
					{
						data: {
							message: "Bookmark deleted successfully",
						},
					},
					HttpStatus.OK,
				)
			} catch (error) {
				console.error("Error deleting bookmark:", error)
				return c.json(
					{
						error: {
							code: "DELETE_BOOKMARK_FAILED" as const,
							message: "Failed to delete bookmark",
							details: ["An error occurred while deleting the bookmark"],
						},
					},
					HttpStatus.INTERNAL_SERVER_ERROR,
				)
			}
		},
	)
	// POST /bookmarks/migrate - Migrate legacy bookmarks
	.openapi(
		createRoute({
			method: "post",
			path: "/migrate",
			description: "Migrate legacy bookmarks to new format",
			summary: "Migrate legacy bookmarks to new format",
			tags: ["Bookmarks"],
			responses: {
				[HttpStatus.CREATED]: jsonContent(
					z.object({
						data: z.object({
							message: z.string(),
						}),
						meta: z.object({
							timestamp: z.string(),
						}),
					}),
					"Legacy bookmarks migrated successfully",
				),
				[HttpStatus.UNAUTHORIZED]: jsonContent(
					z.object({
						error: z.object({
							code: z.string(),
							message: z.string(),
							details: z.array(z.string()),
						}),
					}),
					"Unauthorized",
				),
				[HttpStatus.INTERNAL_SERVER_ERROR]: jsonContent(
					z.object({
						error: z.object({
							code: z.string(),
							message: z.string(),
							details: z.array(z.string()),
						}),
					}),
					"Failed to migrate legacy bookmarks",
				),
			},
			middleware: authMiddleware,
		}),
		async (c) => {
			try {
				const session = c.get("session")
				await bookmarksService.migrateLegacyBookmarks(session)

				return c.json(
					{
						data: { message: "Legacy bookmarks migrated successfully" },
						meta: {
							timestamp: new Date().toISOString(),
						},
					},
					HttpStatus.CREATED,
				)
			} catch (error) {
				console.error("Error migrating bookmarks:", error)
				return c.json(
					{
						error: {
							code: "MIGRATION_FAILED" as const,
							message: "Failed to migrate legacy bookmarks",
							details: ["An error occurred while migrating legacy bookmarks"],
						},
					},
					HttpStatus.INTERNAL_SERVER_ERROR,
				)
			}
		},
	)
