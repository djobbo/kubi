import {
	DISCORD_PROVIDER_ID,
	GOOGLE_PROVIDER_ID,
	type Provider,
} from "@dair/schema/src/auth/oauth-accounts"
import { zValidator } from "@hono/zod-validator"
import { Hono } from "hono"
import { describeRoute as describeOpenApiRoute } from "hono-openapi"
import { resolver } from "hono-openapi/zod"
import { z } from "zod"
import { getOpenAPIErrorResponse } from "../../helpers/error-schema"
import { createSession, validateOAuthCallback } from "../../services/auth"

export const authRoute = new Hono()
	.get(
		"/test/:id",
		describeRoute({
			description: "Test route",
			summary: "Test route",
			tags: ["Test"],
			query: {
				code: queryParam(z.string(), { required: true }),
				state: queryParam(z.string().optional()),
			},
			responses: {
				200: jsonResponse(
					"Test route",
					z.object({
						message: z.string(),
						id: z.string(),
					}),
				),
				400: jsonResponse(
					"Test route",
					z.object({
						error: z.object({
							code: z.number(),
							message: z.string(),
							details: z.array(z.string()).optional(),
						}),
					}),
				),
			},
		}),
		async (c) => {
			const { code, state } = c.req.valid("query")

			if (!code) {
				return c.json["400"](
					{
						error: {
							code: "MISSING_CODE",
							message: "Code is required",
						},
					},
					400,
				)
			}

			return c.json["200"]({
				message: "Hello, world!",
				id: c.req.param("id"),
			})
		},
	)

	// GET /auth/providers/:provider/callback - Handle OAuth callback
	.get(
		"/providers/:provider/callback",
		describeOpenApiRoute({
			description: "Handle OAuth callback from provider",
			summary: "Handle OAuth callback from provider",
			tags: ["Auth"],
			parameters: [
				{
					name: "code",
					in: "query",
					required: true,
					schema: resolver(z.string().optional()),
				},
				{
					name: "state",
					in: "query",
					required: true,
					schema: resolver(z.string().optional()),
				},
			],
			responses: {
				201: {
					description: "Authentication successful",
					content: {
						"application/json": {
							schema: resolver(
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
						},
					},
				},
				400: getOpenAPIErrorResponse(
					"Missing required parameters or invalid provider",
				),
				500: getOpenAPIErrorResponse("Authentication failed"),
			},
		}),
		zValidator(
			"query",
			z.object({
				code: z.string().optional(),
				state: z.string().optional(),
			}),
		),
		async (c) => {
			const provider = c.req.param("provider") as Provider
			if (provider !== GOOGLE_PROVIDER_ID && provider !== DISCORD_PROVIDER_ID) {
				return c.json(
					{
						error: {
							code: "INVALID_PROVIDER",
							message: "Invalid authentication provider",
							details: [
								`Provider '${provider}' is not supported. Supported providers: ${GOOGLE_PROVIDER_ID}, ${DISCORD_PROVIDER_ID}`,
							],
						},
					},
					400,
				)
			}

			const code = c.req.query("code")
			const state = c.req.query("state")

			if (!code) {
				return c.json(
					{
						error: {
							code: "MISSING_CODE",
							message: "Authorization code is required",
							details: [
								"The 'code' parameter is missing from the query string",
							],
						},
					},
					400,
				)
			}

			if (!state) {
				return c.json(
					{
						error: {
							code: "MISSING_STATE",
							message: "State parameter is required",
							details: [
								"The 'state' parameter is missing from the query string",
							],
						},
					},
					400,
				)
			}

			try {
				const user = await validateOAuthCallback(provider, code)
				await createSession(c, user.id)

				return c.json(
					{
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
					},
					201,
				)
			} catch (error) {
				console.error("Auth callback error:", error)
				return c.json(
					{
						error: {
							code: "AUTHENTICATION_FAILED",
							message: "Authentication failed",
							details: ["Failed to validate OAuth callback"],
						},
					},
					500,
				)
			}
		},
	)
