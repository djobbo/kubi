import { createFileRoute, redirect } from "@tanstack/react-router"

import { env } from "@/env"

export const Route = createFileRoute("/(social)/github")({
  beforeLoad: () => {
    throw redirect({ href: env.SOCIAL_GITHUB_URL })
  },
})
