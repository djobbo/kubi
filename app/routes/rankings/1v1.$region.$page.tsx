import { t } from "@lingui/core/macro"
import { createFileRoute, Link } from "@tanstack/react-router"
import { z } from "zod"

import { get1v1Rankings } from "@/features/brawlhalla/api/functions"
import { LegendIcon } from "@/features/brawlhalla/components/Image"
import { RankingsLayout } from "@/features/brawlhalla/components/stats/rankings/RankingsLayout"
import { RankingsTableItem } from "@/features/brawlhalla/components/stats/RankingsTableItem"
import { legendsMap } from "@/features/brawlhalla/constants/legends"
import { cleanString } from "@/helpers/cleanString"
import { seo } from "@/helpers/seo"
import { useDebouncedState } from "@/hooks/useDebouncedState"

export const Route = createFileRoute("/rankings/1v1/$region/$page")({
  component: RouteComponent,
  validateSearch: (search) =>
    z
      .object({
        player: z.string().optional(),
      })
      .parse(search),
  loaderDeps: ({ search: { player } }) => ({ player }),
  loader: async ({ params: { region, page }, deps: { player } }) => {
    const rankings = await get1v1Rankings({
      data: {
        region,
        page: z.coerce.number().parse(page),
        name: player,
      },
    })

    return {
      rankings,
      player,
    }
  },
  head: ({ params, loaderData }) => {
    const { region, page } = params
    const search = loaderData?.player

    const formatedRegion = region === "all" ? t`Global` : region.toUpperCase()
    const formatedSearch = search ? ` - ${search}` : ""

    return {
      meta: seo({
        title: t`Brawlhalla ${formatedRegion} 1v1 Rankings - Page ${page}${
          formatedSearch
        } • Corehalla`,
        description: t`Brawlhalla ${formatedRegion} 1v1 Rankings - Page ${page}${
          formatedSearch
        } • Corehalla`,
      }),
    }
  },
})

function RouteComponent() {
  const { region, page } = Route.useParams()
  const { player } = Route.useSearch()
  const [search, setSearch, immediateSearch] = useDebouncedState(
    player ?? "",
    500,
  )
  const { rankings } = Route.useLoaderData()

  return (
    <RankingsLayout
      brackets={[
        { page: "1v1" },
        { page: "2v2" },
        // { page: "switchcraft", label: "Switchcraft" },
        { page: "power/1v1", label: "Power 1v1" },
        { page: "power/2v2", label: "Power 2v2" },
        { page: "clans", label: "Clans" },
      ]}
      currentBracket="1v1"
      regions={[
        { page: "all", label: "Global" },
        { page: "us-e", label: "US-E" },
        { page: "eu", label: "EU" },
        { page: "sea", label: "SEA" },
        { page: "brz", label: "BRZ" },
        { page: "aus", label: "AUS" },
        { page: "us-w", label: "US-W" },
        { page: "jpn", label: "JPN" },
        { page: "sa", label: "SA" },
        { page: "me", label: "ME" },
      ]}
      currentRegion={region}
      currentPage={page}
      hasPagination={!search}
      hasSearch
      search={immediateSearch}
      setSearch={setSearch}
      searchPlaceholder="Search player..."
      searchSubtitle="Search must start with exact match. Only players that have completed their 10 placement matches are shown."
    >
      <div className="py-4 w-full h-full items-center gap-4 hidden md:flex">
        <p className="w-16 text-center">Rank</p>
        <p className="w-8 text-center">Tier</p>
        <p className="w-16 text-center">Region</p>
        <p className="flex-1">Name</p>
        <p className="w-16 text-center">Games</p>
        <p className="w-32 text-center">W/L</p>
        <p className="w-20 text-center">Winrate</p>
        <p className="w-40 pl-1">Elo</p>
      </div>

      <div className="rounded-lg overflow-hidden border border-bg mb-4 flex flex-col">
        {rankings
          ?.filter((player) =>
            player.name.toLowerCase().startsWith(immediateSearch),
          )
          .map((player, i) => {
            const legend = legendsMap[player.best_legend]

            return (
              <RankingsTableItem
                key={player.brawlhalla_id}
                index={i}
                content={
                  <Link
                    to={`/stats/player/${player.brawlhalla_id}`}
                    className="flex flex-1 items-center gap-2 md:gap-3"
                  >
                    {legend && (
                      <LegendIcon
                        legendNameKey={legend.legend_name_key}
                        alt={legend.bio_name}
                        containerClassName="w-6 h-6 rounded-lg overflow-hidden"
                        className="object-cover object-center"
                      />
                    )}
                    {cleanString(player.name)}
                  </Link>
                }
                {...player}
              />
            )
          })}
      </div>
    </RankingsLayout>
  )
}
