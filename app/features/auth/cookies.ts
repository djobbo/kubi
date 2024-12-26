import { setCookie } from "vinxi/http"

import { env } from "@/env"

export const AUTH_COOKIE_NAME = "auth_session"

export function setSessionTokenCookie(token: string, expiresAt: Date): void {
  setCookie(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
    secure: env.NODE_ENV === "production",
  })
}

export function deleteSessionTokenCookie(): void {
  setCookie(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 0,
    path: "/",
    secure: env.NODE_ENV === "production",
  })
}
