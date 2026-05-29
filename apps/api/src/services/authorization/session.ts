import { randomUUID } from "node:crypto"
import { Database } from "@/services/db"
import { type NewSession, sessionsTable } from "@dair/db"
import { HttpApiBuilder } from "effect/unstable/httpapi"
import { and, eq, gt } from "drizzle-orm"
import { Effect, Redacted } from "effect"
import { sessionApiKey } from "./session-cookie"

const isProduction = (env?: string) => env === "production"

/**
 * Creates a new session for a user
 */
export const createSession = (userId: string) =>
  Effect.gen(function* () {
    const db = yield* Database

    const sessionId = randomUUID()
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days

    // Create session in database
    const newSession: NewSession = {
      userId,
      expiresAt,
    }

    yield* db.insert(sessionsTable).values(newSession)

    yield* HttpApiBuilder.securitySetCookie(
      sessionApiKey,
      Redacted.make(sessionId),
      {
        httpOnly: true,
        secure: isProduction(process.env.NODE_ENV),
        sameSite: "lax",
        path: "/",
        expires: expiresAt,
      },
    )

    return sessionId
  })

/**
 * Deletes a session and clears the cookie
 */
export const deleteSession = (sessionId: string) =>
  Effect.gen(function* () {
    const db = yield* Database

    if (sessionId) {
      // Delete session from database
      yield* db.delete(sessionsTable).where(eq(sessionsTable.id, sessionId))
    }

    // Clear cookie
    yield* HttpApiBuilder.securitySetCookie(sessionApiKey, Redacted.make(""), {
      httpOnly: true,
      secure: isProduction(process.env.NODE_ENV),
      sameSite: "lax",
      path: "/",
      expires: new Date(0),
    })
  })

/**
 * Retrieves a session by ID, validating it hasn't expired
 */
export const getSession = (sessionId: string) =>
  Effect.gen(function* () {
    if (!sessionId) {
      return yield* Effect.succeed(null)
    }

    const db = yield* Database

    // Get session from database
    const session = yield* db.query.sessionsTable.findFirst({
      where: {
        id: { eq: sessionId },
        expiresAt: { gt: new Date() },
      },
      with: {
        user: {
          with: {
            oauthAccounts: true,
            bookmarks: true,
          },
        },
      },
    })

    if (!session) {
      // Session not found or expired, clear cookie
      yield* deleteSession(sessionId)
      return yield* Effect.succeed(null)
    }

    return session
  })
