import { createMiddleware } from "hono/factory"
import { type Session, getSession } from "../services/auth"

export const authMiddleware = createMiddleware<
	{
		Variables: {
			session: Session
		}
	},
	string,
	{
		// TODO: Middlewares not typesafe??
		json: {
			401: {
				error: {
					code: string
					message: string
					details: string[]
				}
			}
		}
	}
>(async (c, next) => {
	const session = await getSession(c)
	if (!session) {
		// return c.json[401]({ error: "Unauthorized" })
		return c.json[401]({
			error: {
				code: "UNAUTHORIZED",
				message: "Unauthorized",
				details: ["You are not authorized to access this resource"],
			},
		})
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
