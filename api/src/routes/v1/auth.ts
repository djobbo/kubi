import {
	DISCORD_PROVIDER_ID,
	GOOGLE_PROVIDER_ID,
	type Provider,
} from "@dair/schema/src/auth/oauth-accounts"
import { Hono } from "hono"
import { env } from "../../env"
import {
	createAuthorizationURL,
	createSession,
	deleteSession,
	validateOAuthCallback,
} from "../../services/auth"

export const authRoute = new Hono()
	.get("/login/:provider", async (c) => {
		const provider = c.req.param("provider") as Provider
		if (provider !== GOOGLE_PROVIDER_ID && provider !== DISCORD_PROVIDER_ID) {
			return c.json({ error: "Invalid provider" }, 400)
		}

		const url = createAuthorizationURL(provider)
		return c.redirect(url)
	})
	.get("/callback/:provider", async (c) => {
		const provider = c.req.param("provider") as Provider
		if (provider !== GOOGLE_PROVIDER_ID && provider !== DISCORD_PROVIDER_ID) {
			return c.json({ error: "Invalid provider" }, 400)
		}

		const code = c.req.query("code")
		const state = c.req.query("state")

		if (!code) {
			return c.json({ error: "Missing code" }, 400)
		}

		if (!state) {
			return c.json({ error: "Missing state" }, 400)
		}

		try {
			const user = await validateOAuthCallback(provider, code)
			await createSession(c, user.id)

			// Redirect to the frontend
			return c.redirect(env.FRONTEND_URL)
		} catch (error) {
			console.error("Auth callback error:", error)
			return c.json({ error: "Authentication failed" }, 500)
		}
	})
	.get("/logout", async (c) => {
		await deleteSession(c)
		return c.json({ success: true })
	})
