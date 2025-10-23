import { randomUUID } from "node:crypto"
import { type NewSession, sessionsTable } from "@dair/schema/src/auth"
import { HttpApiBuilder } from "@effect/platform"
import { and, eq, gt } from "drizzle-orm"
import { Effect, Option, Redacted } from "effect"
import { sessionApiKey } from "."
import { DB, DBError } from "../db"

export const createSession = (userId: string) =>
	Effect.gen(function* () {
		const db = yield* DB

		const sessionId = randomUUID()
		const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days

		// Create session in database
		const newSession: NewSession = {
			id: sessionId,
			userId,
			expiresAt,
		}

		yield* db.use((client) =>
			client.insert(sessionsTable).values(newSession).execute(),
		)

		yield* HttpApiBuilder.securitySetCookie(
			sessionApiKey,
			Redacted.make(sessionId),
			{
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				sameSite: "lax",
				path: "/",
				expires: expiresAt,
			},
		)

		return sessionId
	})

export const deleteSession = (sessionId: string) =>
	Effect.gen(function* () {
		const maybeDb = yield* Effect.serviceOption(DB)
		const db = Option.getOrThrowWith(
			maybeDb,
			() =>
				new DBError({
					message: "DB not found",
				}),
		)

		if (sessionId) {
			// Delete session from database
			yield* db.use((client) =>
				client
					.delete(sessionsTable)
					.where(eq(sessionsTable.id, sessionId))
					.execute(),
			)
		}

		// Clear cookie
		yield* HttpApiBuilder.securitySetCookie(sessionApiKey, Redacted.make(""), {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			path: "/",
			expires: new Date(0),
		})
	})

export const getSession = (sessionId: string) =>
	Effect.gen(function* () {
		if (!sessionId) return yield* Effect.succeed(null)

		// TODO: remove serviceOptional once HttpApi Middlewares accept custom services
		const maybeDb = yield* Effect.serviceOption(DB)
		const db = Option.getOrThrowWith(
			maybeDb,
			() =>
				new DBError({
					message: "DB not found",
				}),
		)

		// Get session from database
		const session = yield* db.use(
			async (client) =>
				await client.query.sessionsTable
					.findFirst({
						where: and(
							eq(sessionsTable.id, sessionId),
							gt(sessionsTable.expiresAt, new Date()),
						),
						with: {
							user: {
								with: {
									oauthAccounts: true,
									bookmarks: true,
								},
							},
						},
					})
					.execute(),
		)

		if (!session) {
			// Session not found or expired, clear cookie
			yield* deleteSession(sessionId)
			return yield* Effect.succeed(null)
		}

		return session
	})
