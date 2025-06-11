import { createFileRoute, redirect } from "@tanstack/react-router"

import { env } from "@/env"

export const Route = createFileRoute("/(social)/discord")({
	beforeLoad: () => {
		throw redirect({ href: env.VITE_SOCIAL_DISCORD_URL })
	},
})
