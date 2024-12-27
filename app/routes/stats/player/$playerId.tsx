import { t } from "@lingui/core/macro"
import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"

import {
  getPlayerRanked,
  getPlayerStats,
} from "@/features/brawlhalla/api/functions"
import { seo } from "@/helpers/seo"

export const Route = createFileRoute("/stats/player/$playerId")({
  component: RouteComponent,
  loader: async ({ params: { playerId } }) => {
    const id = z.coerce.number().parse(playerId)

    const [stats, ranked] = await Promise.all([
      getPlayerStats({ data: id }),
      getPlayerRanked({ data: id }),
    ] as const)

    return {
      player: {
        id,
        stats,
        ranked,
      },
    }
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {}

    const {
      player: {
        stats: { name },
      },
    } = loaderData

    return {
      meta: seo({
        title: t`${name} - Player Stats • Corehalla`,
        description: t`${name} Stats - Brawlhalla Player Stats • Corehalla`,
      }),
    }
  },
})

function RouteComponent() {
  const { player } = Route.useLoaderData()

  return (
    <div>
      <p>Hello {player.stats.name}!</p>
      <pre>{JSON.stringify(player.stats, null, 2)}</pre>
      <pre>{JSON.stringify(player.ranked, null, 2)}</pre>
    </div>
  )
}
