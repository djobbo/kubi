import { createServerFn } from "@tanstack/start"
import { parseCookies } from "vinxi/http"

import type { SessionValidationResult } from "../api"
import { validateSessionToken } from "../api"
import { AUTH_COOKIE_NAME, deleteSessionTokenCookie } from "../cookies"

export const getSession = createServerFn({ method: "GET" }).handler(
  async (): Promise<SessionValidationResult> => {
    const sessionId = parseCookies()[AUTH_COOKIE_NAME]
    if (!sessionId) {
      return { session: null, user: null }
    }

    const { session, user } = await validateSessionToken(sessionId)

    if (!session) {
      deleteSessionTokenCookie()
      return { session: null, user: null }
    }

    return { session, user }
  },
)
