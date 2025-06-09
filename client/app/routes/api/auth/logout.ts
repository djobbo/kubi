import { createAPIFileRoute } from "@tanstack/react-start/api"
import { parseCookies, setHeader } from "vinxi/http"

import { invalidateSession, validateSessionToken } from "@/features/auth/api"
import {
  AUTH_COOKIE_NAME,
  deleteSessionTokenCookie,
} from "@/features/auth/cookies"

export const APIRoute = createAPIFileRoute("/api/auth/logout")({
  POST: async () => {
    setHeader("Location", "/")

    const sessionId = parseCookies()[AUTH_COOKIE_NAME]
    if (!sessionId) {
      return new Response(null, { status: 401 })
    }

    const { session } = await validateSessionToken(sessionId)
    deleteSessionTokenCookie()

    if (!session) {
      return new Response(null, { status: 401 })
    }

    await invalidateSession(session.id)

    return new Response(null, { status: 302 })
  },
})
