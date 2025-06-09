import { createFileRoute, redirect } from "@tanstack/react-router"

import { env } from "@/env"

export const Route = createFileRoute("/(social)/discord")({
  beforeLoad: () => {
    throw redirect({ href: env.SOCIAL_DISCORD_URL })
  },
})
