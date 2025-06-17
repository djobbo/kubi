import { createMiddleware } from "hono/factory"
import { type Session, getSession } from "../services/auth"

export const authMiddleware = createMiddleware<{
	Variables: {
		session: Session
	}
}>(async (c, next) => {
	const session = await getSession(c)
	if (!session) {
		return c.json({ error: "Unauthorized" }, 401)
	}
	c.set("session", session)
	await next()
})

export const authWithProfileMiddleware = createMiddleware<{
	Variables: {
		session: Session
	}
}>(async (c, next) => {
	const session = await getSession(c, {
		includeProfile: true,
	})
	if (!session) {
		return c.json({ error: "Unauthorized" }, 401)
	}
	c.set("session", session)
	await next()
})

export const optionalAuthMiddleware = createMiddleware<{
	Variables: {
		session: Session | null
	}
}>(async (c, next) => {
	const session = await getSession(c)
	c.set("session", session)
	await next()
})
