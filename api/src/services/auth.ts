import { randomUUID } from "node:crypto"
import {
	DISCORD_PROVIDER_ID,
	GOOGLE_PROVIDER_ID,
	type NewOAuthAccount,
	type NewSession,
	type NewUser,
	type Provider,
	oauthAccountsTable,
	sessionsTable,
	usersTable,
} from "@dair/schema/src/auth"
import { Discord, Google, generateState } from "arctic"
import { and, eq, gt } from "drizzle-orm"
import type { Context } from "hono"
import { getCookie, setCookie } from "hono/cookie"
import { db } from "../db"
import { env } from "../env"

// Initialize OAuth providers
export const google = new Google(
	env.GOOGLE_CLIENT_ID,
	env.GOOGLE_CLIENT_SECRET,
	`${env.API_URL}/v1/auth/callback/${GOOGLE_PROVIDER_ID}`,
)

export const discord = new Discord(
	env.DISCORD_CLIENT_ID,
	env.DISCORD_CLIENT_SECRET,
	`${env.API_URL}/v1/auth/callback/${DISCORD_PROVIDER_ID}`,
)

interface GoogleUserInfo {
	id: string
	email: string
	name: string
	picture: string
}

interface DiscordUserInfo {
	id: string
	email: string
	username: string
	avatar: string
	verified?: boolean
}

export async function validateOAuthCallback(provider: Provider, code: string) {
	// Exchange code for tokens
	const tokens =
		provider === GOOGLE_PROVIDER_ID
			? await google.validateAuthorizationCode(code, env.AUTH_SECRET)
			: await discord.validateAuthorizationCode(code, null)
	const accessToken = tokens.accessToken()
	const refreshToken = tokens.refreshToken()
	const expiresAt = new Date(Date.now() + 3600 * 1000) // Default to 1 hour if not provided
	const updatedAt = new Date()

	// Get user info from provider
	let userInfo: GoogleUserInfo | DiscordUserInfo
	if (provider === GOOGLE_PROVIDER_ID) {
		const response = await fetch(
			"https://www.googleapis.com/oauth2/v2/userinfo",
			{
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			},
		)
		userInfo = (await response.json()) as GoogleUserInfo
	} else {
		const response = await fetch("https://discord.com/api/users/@me", {
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		})
		userInfo = (await response.json()) as DiscordUserInfo

		// For discord auth, we need to verify that the email is verified
		if (!userInfo.verified) {
			throw new Error("Discord email is not verified")
		}
	}

	// Check if user exists with this OAuth account
	const existingOAuthAccount = await db.query.oauthAccountsTable.findFirst({
		where: and(
			eq(oauthAccountsTable.provider, provider),
			eq(oauthAccountsTable.providerUserId, userInfo.id),
		),
		with: {
			user: true,
		},
	})

	if (existingOAuthAccount) {
		// Update tokens
		await db
			.update(oauthAccountsTable)
			.set({
				accessToken,
				refreshToken,
				expiresAt,
				updatedAt,
			})
			.where(
				and(
					eq(oauthAccountsTable.provider, provider),
					eq(oauthAccountsTable.providerUserId, userInfo.id),
				),
			)

		return existingOAuthAccount.user
	}

	// Check if user exists with this email
	const existingUser = await db.query.usersTable.findFirst({
		where: eq(usersTable.email, userInfo.email),
	})

	if (existingUser) {
		// Create new OAuth account for existing user
		const newOAuthAccount: NewOAuthAccount = {
			id: randomUUID(),
			userId: existingUser.id,
			provider,
			providerUserId: userInfo.id,
			accessToken,
			refreshToken,
			expiresAt,
			updatedAt,
		}

		await db.insert(oauthAccountsTable).values(newOAuthAccount)
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

	const [createdUser] = await db.insert(usersTable).values(newUser).returning()
	if (!createdUser) {
		throw new Error("Failed to create user")
	}

	const newOAuthAccount: NewOAuthAccount = {
		id: randomUUID(),
		userId: createdUser.id,
		provider,
		providerUserId: userInfo.id,
		accessToken,
		refreshToken,
		expiresAt,
		updatedAt,
	}

	await db.insert(oauthAccountsTable).values(newOAuthAccount)

	return createdUser
}

export function createAuthorizationURL(provider: Provider) {
	const state = generateState()
	return provider === GOOGLE_PROVIDER_ID
		? google.createAuthorizationURL(state, env.AUTH_SECRET, [
				"https://www.googleapis.com/auth/userinfo.email",
				"https://www.googleapis.com/auth/userinfo.profile",
			])
		: discord.createAuthorizationURL(state, null, ["identify", "email"])
}

// Session management
export const SESSION_COOKIE = "dair-session"

export async function createSession(c: Context, userId: string) {
	const sessionId = randomUUID()
	const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days

	// Create session in database
	const newSession: NewSession = {
		id: sessionId,
		userId,
		expiresAt,
	}

	await db.insert(sessionsTable).values(newSession)

	// Set cookie
	setCookie(c, SESSION_COOKIE, sessionId, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "Lax",
		path: "/",
		expires: expiresAt,
	})

	return sessionId
}

export async function getSession(
	c: Context,
	options: { includeProfile?: boolean } = {},
) {
	const sessionId = getCookie(c, SESSION_COOKIE)
	if (!sessionId) return null

	// Get session from database
	const session = await db.query.sessionsTable.findFirst({
		where: and(
			eq(sessionsTable.id, sessionId),
			gt(sessionsTable.expiresAt, new Date()),
		),
		with: {
			user: {
				with: {
					oauthAccounts: true,
					bookmarks: options.includeProfile ? true : undefined,
				},
			},
		},
	})

	if (!session) {
		// Session not found or expired, clear cookie
		await deleteSession(c)
		return null
	}

	return session
}

export type Session = NonNullable<Awaited<ReturnType<typeof getSession>>>

export async function deleteSession(c: Context) {
	const sessionId = getCookie(c, SESSION_COOKIE)
	if (sessionId) {
		// Delete session from database
		await db.delete(sessionsTable).where(eq(sessionsTable.id, sessionId))
	}

	// Clear cookie
	setCookie(c, SESSION_COOKIE, "", {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "Lax",
		path: "/",
		expires: new Date(0),
	})
}
