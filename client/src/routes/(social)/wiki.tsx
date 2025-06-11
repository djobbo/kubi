import { createFileRoute, redirect } from "@tanstack/react-router"

import { env } from "@/env"

export const Route = createFileRoute("/(social)/wiki")({
	beforeLoad: () => {
		throw redirect({ href: env.VITE_BRAWLHALLA_WIKI_URL })
	},
})
