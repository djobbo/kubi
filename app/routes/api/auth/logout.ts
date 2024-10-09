import { createAPIFileRoute } from "@tanstack/start/api"
import { parseCookies, setCookie, setHeader } from "vinxi/http"

import { lucia } from "@/features/auth/lucia"

export const Route = createAPIFileRoute("/api/auth/logout")({
  POST: async () => {
    // eslint-disable-next-line lingui/no-unlocalized-strings
    setHeader("Location", "/")

    const sessionId = parseCookies()[lucia.sessionCookieName]
    if (!sessionId) {
      return new Response(null, { status: 401 })
    }

    const { session } = await lucia.validateSession(sessionId)
    const sessionCookie = lucia.createBlankSessionCookie()
    setCookie(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)

    if (!session) {
      return new Response(null, { status: 401 })
    }

    await lucia.invalidateSession(session.id)

    return new Response(null, { status: 302 })
  },
})
