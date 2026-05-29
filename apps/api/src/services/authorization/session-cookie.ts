import { HttpApiSecurity } from "effect/unstable/httpapi"

const SESSION_COOKIE = "dair-session"

export const sessionApiKey = HttpApiSecurity.apiKey({
  in: "cookie",
  key: SESSION_COOKIE,
})
