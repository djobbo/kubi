import { randomUUID } from "node:crypto"
import {
	type NewOAuthAccount,
	type NewUser,
	type Provider,
	oauthAccountsTable,
	usersTable,
} from "@dair/schema/src/auth"
import { BadRequest } from "@effect/platform/HttpApiError"
import { and, eq } from "drizzle-orm"
import { Effect } from "effect"
import type { AuthorizationProvider } from "."
import { DB, DBError } from "../db"

export const validateOAuthCallback =
	(providers: Record<string, AuthorizationProvider>) =>
	(providerName: Provider, code: string) =>
		Effect.gen(function* () {
			const provider = providers[providerName]
			if (!provider) {
				return yield* Effect.fail(new BadRequest())
			}

			const tokens = yield* provider.getTokens(code)
			const accessToken = tokens.accessToken()
			const refreshToken = tokens.refreshToken()
			const expiresAt = new Date(Date.now() + 3600 * 1000) // Default to 1 hour if not provided
			const updatedAt = new Date()

			const userInfo = yield* provider.getUserInfo(accessToken)

			const db = yield* DB


			// Check if user exists with this OAuth account
			const existingOAuthAccount = yield* db.use((client) =>
				client.query.oauthAccountsTable
					.findFirst({
						where: and(
							eq(oauthAccountsTable.provider, providerName),
							eq(oauthAccountsTable.providerUserId, userInfo.id),
						),
						with: {
							user: true,
						},
					})
					.execute(),
			)

			if (existingOAuthAccount) {
				// Update tokens
				yield* db.use((client) =>
					client
						.update(oauthAccountsTable)
						.set({
							accessToken,
							refreshToken,
							expiresAt,
							updatedAt,
						})
						.where(
							and(
								eq(oauthAccountsTable.provider, providerName),
								eq(oauthAccountsTable.providerUserId, userInfo.id),
							),
						)
						.execute(),
				)

				return yield* Effect.succeed(existingOAuthAccount.user)
			}

			// Check if user exists with this email
			// TODO: Change this
			// Use current session to link accounts?
			const existingUser = yield* db.use((client) =>
				client.query.usersTable
					.findFirst({
						where: eq(usersTable.email, userInfo.email),
					})
					.execute(),
			)

			if (existingUser) {
				// Create new OAuth account for existing user
				const newOAuthAccount: NewOAuthAccount = {
					id: randomUUID(),
					userId: existingUser.id,
					provider: providerName,
					providerUserId: userInfo.id,
					accessToken,
					refreshToken,
					expiresAt,
					updatedAt,
				}

				yield* db.use((client) =>
					client.insert(oauthAccountsTable).values(newOAuthAccount).execute(),
				)
				return existingUser
			}

			// Create new user and OAuth account
			const newUser: NewUser = {
				id: randomUUID(),
				email: userInfo.email,
				username:
					"username" in userInfo
						? userInfo.username
						: userInfo.email.split("@")[0] || "anonymous",
				avatarUrl:
					"picture" in userInfo
						? userInfo.picture
						: `https://cdn.discordapp.com/avatars/${userInfo.id}/${userInfo.avatar}.png`,
			}

			const [createdUser] = yield* db.use((client) =>
				client.insert(usersTable).values(newUser).returning().execute(),
			)
			if (!createdUser) {
				return yield* Effect.fail(
					new DBError({
						message: "Failed to create user",
					}),
				)
			}

			const newOAuthAccount: NewOAuthAccount = {
				id: randomUUID(),
				userId: createdUser.id,
				provider: providerName,
				providerUserId: userInfo.id,
				accessToken,
				refreshToken,
				expiresAt,
				updatedAt,
			}

			yield* db.use((client) =>
				client.insert(oauthAccountsTable).values(newOAuthAccount).execute(),
			)

			return yield* Effect.succeed(createdUser)
		})
