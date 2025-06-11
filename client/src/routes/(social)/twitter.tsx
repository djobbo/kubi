import { createFileRoute, redirect } from "@tanstack/react-router"

import { env } from "@/env"

export const Route = createFileRoute("/(social)/twitter")({
	beforeLoad: () => {
		throw redirect({ href: env.VITE_SOCIAL_TWITTER_URL })
	},
})
