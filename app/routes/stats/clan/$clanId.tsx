import { t } from "@lingui/core/macro"
import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"

import { getClan } from "@/features/brawlhalla/api/functions"
import { ClanMember } from "@/features/brawlhalla/components/stats/clan/ClanMember"
import type { MiscStat } from "@/features/brawlhalla/components/stats/MiscStatGroup"
import { StatsHeader } from "@/features/brawlhalla/components/stats/StatsHeader"
import { cleanString } from "@/helpers/cleanString"
import { formatUnixTime } from "@/helpers/date"
import { seo } from "@/helpers/seo"

export const Route = createFileRoute("/stats/clan/$clanId")({
  component: RouteComponent,
  loader: async ({ params: { clanId } }) => {
    const id = z.coerce.number().parse(clanId)

    const clan = await getClan({ data: id })

    return {
      clan,
    }
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {}

    const {
      clan: { clan_name },
    } = loaderData

    return {
      meta: seo({
        title: t`${clan_name} - Clan Stats • Corehalla`,
        description: t`${clan_name} Stats - Brawlhalla Clan Stats • Corehalla`,
      }),
    }
  },
})

const clanRankWeights = {
  Leader: 0,
  Officer: 1,
  Member: 2,
  Recruit: 3,
} as const

function RouteComponent() {
  const { clan } = Route.useLoaderData()

  const clanName = cleanString(clan.clan_name)

  const clanStats: MiscStat[] = [
    {
      name: t`Created on`,
      value: formatUnixTime(clan.clan_create_date),
      desc: t`Date when ${clanName} was created`,
    },
    // {
    //     name: "Level",
    //     value: "TBA",
    // },
    {
      name: t`XP`,
      value: clan.clan_xp,
      desc: t`XP earned by ${clanName} members since creation`,
    },
    {
      name: t`Members`,
      value: clan.clan.length,
      desc: t`Number of members in ${clanName}`,
    },
  ]

  const sortedMembers = clan.clan.sort((a, b) => {
    const rankDiff = clanRankWeights[a.rank] - clanRankWeights[b.rank]

    if (rankDiff === 0) {
      return a.join_date - b.join_date
    }

    return rankDiff
  })

  return (
    <>
      <StatsHeader
        name={cleanString(clan.clan_name)}
        id={clan.clan_id}
        miscStats={clanStats}
        bookmark={{
          pageType: "clan_stats",
          pageId: clan.clan_id.toString(),
          name: cleanString(clan.clan_name),
          meta: { type: "clan_stats" },
        }}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
        {sortedMembers.map((member) => (
          <ClanMember key={member.brawlhalla_id} member={member} clan={clan} />
        ))}
      </div>
    </>
  )
}
