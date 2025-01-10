import { createFileRoute, redirect } from "@tanstack/react-router"

import { env } from "@/env"

export const Route = createFileRoute("/(social)/wiki")({
  beforeLoad: () => {
    throw redirect({ href: env.BRAWLHALLA_WIKI_URL })
  },
})
