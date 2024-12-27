import { createFileRoute, redirect } from "@tanstack/react-router"

import { env } from "@/env"

export const Route = createFileRoute("/(social)/twitter")({
  beforeLoad: () => {
    throw redirect({ href: env.SOCIAL_TWITTER_URL })
  },
})
