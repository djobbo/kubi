import { createEnv } from "@t3-oss/env-core"
import { z } from "zod"

export const env = createEnv({
	clientPrefix: "VITE_",
	client: {
		VITE_CLIENT_URL: z.string().url(),
		VITE_API_URL: z.string().url(),

		VITE_SOCIAL_DISCORD_URL: z.string().min(1),
		VITE_SOCIAL_GITHUB_URL: z.string().min(1),
		VITE_SOCIAL_TWITTER_URL: z.string().min(1),
		VITE_SOCIAL_KOFI_URL: z.string().min(1),
		VITE_BRAWLHALLA_WIKI_URL: z.string().min(1),

		VITE_GOOGLE_ANALYTICS_TRACKING_ID: z.string().min(1),
		VITE_GOOGLE_ADSENSE_ID: z.string().min(1),
	},
	runtimeEnv: import.meta.env,
	emptyStringAsUndefined: true,
})
