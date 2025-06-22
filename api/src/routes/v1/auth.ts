import {
	bookmarkSelectSchema,
	sessionSelectSchema,
	userSelectSchema,
} from "@dair/schema"
import {
	DISCORD_PROVIDER_ID,
	GOOGLE_PROVIDER_ID,
	oauthAccountSelectSchema,
} from "@dair/schema/src/auth/oauth-accounts"
import { Hono } from "hono"
import { z } from "zod/v4"
import {
	contentlessResponse,
	describeRoute,
	jsonErrorResponse,
	jsonResponse,
	queryParam,
} from "../../helpers/describe-route"
import { optionalAuthMiddleware } from "../../middlewares/auth-middleware"
import {
	createAuthorizationURL,
	createSession,
	deleteSession,
	validateOAuthCallback,
} from "../../services/auth"

export const authRoute = new Hono()
	// GET /auth/session - Get current session
	.get(
		"/session",
		describeRoute({
			description: "Get current user session",
			summary: "Get current user session",
			tags: ["Auth"],
			responses: {
				200: jsonResponse(
					"Session retrieved successfully",
					z.object({
						data: z.object({
							session: sessionSelectSchema
								.extend({
									user: userSelectSchema.extend({
										oauthAccounts: z.array(oauthAccountSelectSchema),
										bookmarks: z.array(bookmarkSelectSchema),
									}),
								})
								.nullable(),
						}),
						meta: z.object({
							timestamp: z.string(),
						}),
					}),
				),
			},
		}),
		optionalAuthMiddleware,
		async (c) => {
			const session = c.get("session")
			return c.json[200]({
				data: { session },
				meta: {
					timestamp: new Date().toISOString(),
				},
			})
		},
	)
	// GET /auth/providers/:provider/authorize - Get authorization URL
	.get(
		"/providers/:provider/authorize",
		describeRoute({
			description: "Get OAuth authorization URL for the specified provider",
			summary: "Get OAuth authorization URL for the specified provider",
			tags: ["Auth"],
			responses: {
				200: jsonResponse(
					"Authorization URL generated successfully",
					z.object({
						data: z.object({
							authorizationUrl: z.string(),
						}),
						meta: z.object({
							provider: z.string(),
							timestamp: z.string(),
						}),
					}),
				),
				400: jsonErrorResponse("Invalid provider specified", [
					"INVALID_PROVIDER",
				] as const),
			},
		}),
		async (c) => {
			const provider = c.req.param("provider")
			if (provider !== GOOGLE_PROVIDER_ID && provider !== DISCORD_PROVIDER_ID) {
				return c.json[400]({
					error: {
						code: "INVALID_PROVIDER",
						message: "Invalid authentication provider",
						details: [
							`Provider '${provider}' is not supported. Supported providers: ${GOOGLE_PROVIDER_ID}, ${DISCORD_PROVIDER_ID}`,
						],
					},
				})
			}

			const url = createAuthorizationURL(provider)
			return c.json[200]({
				data: { authorizationUrl: url.toString() },
				meta: {
					provider,
					timestamp: new Date().toISOString(),
				},
			})
		},
	)
	// GET /auth/providers/:provider/callback - Handle OAuth callback
	.get(
		"/providers/:provider/callback",
		describeRoute({
			description: "Handle OAuth callback from provider",
			summary: "Handle OAuth callback from provider",
			tags: ["Auth"],
			query: {
				code: queryParam(z.string(), { required: true }),
				state: queryParam(z.string(), { required: true }),
			},
			responses: {
				201: jsonResponse(
					"Authentication successful",
					z.object({
						data: z.object({
							user: z.object({
								id: z.string(),
								provider: z.string(),
							}),
						}),
						meta: z.object({
							provider: z.string(),
							timestamp: z.string(),
						}),
					}),
				),
				400: jsonErrorResponse("Invalid provider specified", [
					"INVALID_PROVIDER",
					"MISSING_CODE",
					"MISSING_STATE",
				] as const),
				401: jsonErrorResponse("Authentication failed", [
					"AUTHENTICATION_FAILED",
				] as const),
			},
		}),
		async (c) => {
			const provider = c.req.param("provider")
			if (provider !== GOOGLE_PROVIDER_ID && provider !== DISCORD_PROVIDER_ID) {
				return c.json[400]({
					error: {
						code: "INVALID_PROVIDER",
						message: "Invalid authentication provider",
						details: [
							`Provider '${provider}' is not supported. Supported providers: ${GOOGLE_PROVIDER_ID}, ${DISCORD_PROVIDER_ID}`,
						],
					},
				})
			}

			const code = c.req.query("code")
			const state = c.req.query("state")

			if (!code) {
				return c.json[400]({
					error: {
						code: "MISSING_CODE",
						message: "Authorization code is required",
						details: ["The 'code' parameter is missing from the query string"],
					},
				})
			}

			if (!state) {
				return c.json[400]({
					error: {
						code: "MISSING_STATE",
						message: "State parameter is required",
						details: ["The 'state' parameter is missing from the query string"],
					},
				})
			}

			try {
				const user = await validateOAuthCallback(provider, code)
				await createSession(c, user.id)

				return c.json[201]({
					data: {
						user: {
							id: user.id,
							provider,
						},
					},
					meta: {
						provider,
						timestamp: new Date().toISOString(),
					},
				})
			} catch (error) {
				console.error("Auth callback error:", error)
				return c.json[401]({
					error: {
						code: "AUTHENTICATION_FAILED",
						message: "Authentication failed",
						details: ["Failed to validate OAuth callback"],
					},
				})
			}
		},
	)
	// DELETE /auth/session - Logout (delete session)
	.delete(
		"/session",
		describeRoute({
			description: "Delete current user session (logout)",
			summary: "Delete current user session (logout)",
			tags: ["Auth"],
			contentless: {
				204: contentlessResponse("Session deleted successfully"),
			},
		}),
		async (c) => {
			await deleteSession(c)
			return c.status(204)
		},
	)
