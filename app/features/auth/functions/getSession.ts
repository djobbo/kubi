import { createServerFn } from "@tanstack/start"
import { parseCookies, setCookie } from "vinxi/http"

import { lucia } from "@/features/auth/lucia"

export const getSession = createServerFn({ method: "GET" }).handler(
  async () => {
    const sessionId = parseCookies()[lucia.sessionCookieName]
    if (!sessionId) {
      return { user: null }
    }

    const result = await lucia.validateSession(sessionId)

    if (result.session?.fresh) {
      const sessionCookie = lucia.createSessionCookie(result.session.id)
      setCookie(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes,
      )
    }

    if (!result.session) {
      const sessionCookie = lucia.createBlankSessionCookie()
      setCookie(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes,
      )
    }

    return { user: result.user }
  },
)
