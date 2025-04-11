import { sha256 } from "@oslojs/crypto/sha2"
import {
  encodeBase32LowerCaseNoPadding,
  encodeHexLowerCase,
} from "@oslojs/encoding"
import { eq } from "drizzle-orm"

import { db } from "@/db"
import type { OAuthAccount, User } from "@/db/schema"
import {
  oauthAccountsTable,
  type Session,
  sessionsTable,
  usersTable,
} from "@/db/schema"

export const generateSessionToken = (): string => {
  const bytes = new Uint8Array(20)
  crypto.getRandomValues(bytes)
  const token = encodeBase32LowerCaseNoPadding(bytes)
  return token
}

export const createSession = async (
  token: string,
  userId: string,
): Promise<Session> => {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)))
  const session: Session = {
    id: sessionId,
    userId,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
  }
  await db.insert(sessionsTable).values(session)
  return session
}

export const validateSessionToken = async (
  token: string,
): Promise<SessionValidationResult> => {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)))
  const result = await db
    .select({ user: usersTable, session: sessionsTable })
    .from(sessionsTable)
    .innerJoin(usersTable, eq(sessionsTable.userId, usersTable.id))
    .where(eq(sessionsTable.id, sessionId))
  if (result.length < 1) {
    return { session: null, user: null, oauth: null }
  }
  const { user, session } = result[0]
  if (Date.now() >= session.expiresAt.getTime()) {
    await db.delete(sessionsTable).where(eq(sessionsTable.id, session.id))
    return { session: null, user: null, oauth: null }
  }

  const oauth = await db
    .select()
    .from(oauthAccountsTable)
    .where(eq(oauthAccountsTable.userId, user.id))
    .execute()

  if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
    session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
    await db
      .update(sessionsTable)
      .set({
        expiresAt: session.expiresAt,
      })
      .where(eq(sessionsTable.id, session.id))
  }
  return { session, user, oauth }
}

export const invalidateSession = async (sessionId: string): Promise<void> => {
  await db.delete(sessionsTable).where(eq(sessionsTable.id, sessionId))
}

export type SessionValidationResult =
  | { session: Session; user: User; oauth: OAuthAccount[] }
  | { session: null; user: null; oauth: null }
