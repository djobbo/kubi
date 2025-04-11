import { createServerFn } from "@tanstack/react-start"
import { parseCookies } from "vinxi/http"

import type { SessionValidationResult } from "../api"
import { validateSessionToken } from "../api"
import { AUTH_COOKIE_NAME, deleteSessionTokenCookie } from "../cookies"

export const getSession = createServerFn({ method: "GET" }).handler(
  async (): Promise<SessionValidationResult> => {
    const sessionId = parseCookies()[AUTH_COOKIE_NAME]
    if (!sessionId) {
      return { session: null, user: null, oauth: null }
    }

    const { session, user, oauth } = await validateSessionToken(sessionId)

    if (!session) {
      deleteSessionTokenCookie()
      return { session: null, user: null, oauth: null }
    }

    return { session, user, oauth }
  },
)
