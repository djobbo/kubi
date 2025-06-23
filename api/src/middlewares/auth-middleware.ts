import { type Session, getSession } from "@/services/auth"
import { createMiddleware } from "hono/factory"

export const authMiddleware = createMiddleware<{
	Variables: {
		session: Session
	}
}>(async (c, next) => {
	const session = await getSession(c)
	if (!session) {
		return c.json(
			{
				error: {
					code: "UNAUTHORIZED" as const,
					message: "Unauthorized",
					details: ["You are not authorized to access this resource"],
				},
			},
			401,
		)
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
