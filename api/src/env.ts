import { createEnv } from "@t3-oss/env-core"
import { z } from "zod"

export const env = createEnv({
	server: {
		BRAWLHALLA_API_KEY: z.string().min(1),
		USE_MOCK_DATA: z.optional(
			z
				.string()
				.refine((s) => s === "true" || s === "false")
				.transform((s) => s === "true"),
		),
		CACHE_MAX_AGE_OVERRIDE: z.optional(z.coerce.number()),
		DATABASE_URL: z.string().min(1),
		CACHE_VERSION: z.coerce.number(),
		API_URL: z.string().url(),
		// OAuth providers
		GOOGLE_CLIENT_ID: z.string().min(1),
		GOOGLE_CLIENT_SECRET: z.string().min(1),
		DISCORD_CLIENT_ID: z.string().min(1),
		DISCORD_CLIENT_SECRET: z.string().min(1),
		// Auth
		AUTH_SECRET: z.string().min(1),
		FRONTEND_URL: z.string().url(),
	},
	runtimeEnv: process.env,
	emptyStringAsUndefined: true,
})
