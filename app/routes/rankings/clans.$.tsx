import { t } from "@lingui/core/macro"
import { Trans } from "@lingui/react/macro"
import { createFileRoute, Link } from "@tanstack/react-router"
import { z } from "zod"

import { CLANS_RANKINGS_PER_PAGE } from "@/features/archive/constants"
import { getClanRankings } from "@/features/archive/functions/clans/get-clan-rankings"
import { RankingsLayout } from "@/features/brawlhalla/components/stats/rankings/RankingsLayout"
import { cleanString } from "@/helpers/cleanString"
import { seo } from "@/helpers/seo"
import { useDebouncedState } from "@/hooks/useDebouncedState"
import { cn } from "@/ui/lib/utils"

export const Route = createFileRoute("/rankings/clans/$")({
  component: RouteComponent,
  validateSearch: (search) =>
    z
      .object({
        clan: z.string().optional(),
      })
      .parse(search),
  loaderDeps: ({ search: { clan } }) => ({ clan }),
  loader: async ({ params: { _splat }, deps: { clan } }) => {
    const [page = "1"] = _splat?.split("/") ?? []
    const pageInt = z.coerce.number().min(1).catch(1).parse(page)

    const rankings = await getClanRankings({
      data: {
        query: {
          clan,
          limit: CLANS_RANKINGS_PER_PAGE,
          page: pageInt,
        },
      },
    })

    return {
      rankings,
      clan,
      page: pageInt,
    }
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {}

    const { page, clan } = loaderData

    const formatedSearch = clan ? ` - ${clan}` : ""

    return {
      meta: seo({
        title: t`Brawlhalla Clan Rankings - Page ${page}${
          formatedSearch
        } • Corehalla`,
        description: t`Brawlhalla Clan Rankings - Page ${page}${
          formatedSearch
        } • Corehalla`,
      }),
    }
  },
})

function RouteComponent() {
  const { clan, page, rankings } = Route.useLoaderData()
  const [search, setSearch, immediateSearch] = useDebouncedState(
    clan ?? "",
    500,
  )

  const showClanRank = !search

  return (
    <RankingsLayout
      brackets={[
        { page: "1v1", label: t`1v1` },
        { page: "2v2", label: t`2v2` },
        { page: "rotating", label: t`Rotating` },
        { page: "power/1v1", label: t`Power 1v1` },
        { page: "power/2v2", label: t`Power 2v2` },
        { page: "clans", label: t`Clans` },
      ]}
      currentBracket="clans"
      regions={null}
      currentPage={page.toString()}
      hasSearch
      search={immediateSearch}
      setSearch={setSearch}
      hasPagination
      searchPlaceholder={t`Search clan...`}
      searchSubtitle={t`Search by clan name (exactly as it appears in-game). Clan search/rankings is still in early development.`}
    >
      <div className="p-4 w-full h-full flex items-center gap-4">
        {showClanRank && (
          <p className="w-16 text-center">
            <Trans>Rank</Trans>
          </p>
        )}
        <p className="flex-1">
          <Trans>Name</Trans>
        </p>
        <p className="w-40 pl-1 text-center">
          <Trans>Created on</Trans>
        </p>
        <p className="w-20 pl-1 text-center">XP</p>
      </div>

      <div className="rounded-lg overflow-hidden border border-bg mb-4 flex flex-col">
        {rankings
          .filter((clan) => clan.name.toLowerCase().startsWith(immediateSearch))
          .map((clan, i) => {
            return (
              <div
                key={clan.id}
                className={cn(
                  "px-4 py-2 w-full h-full flex items-center gap-4 hover:bg-bg",
                  { "bg-bgVar2": i % 2 === 0 },
                )}
              >
                {showClanRank && (
                  <p className="w-16 h-full flex items-center justify-center text-xs">
                    {(page - 1) * CLANS_RANKINGS_PER_PAGE + i + 1}
                  </p>
                )}
                <p className="flex flex-1 items-center">
                  <Link
                    to="/stats/clan/$clanId"
                    params={{ clanId: clan.id.toString() }}
                  >
                    {cleanString(clan.name)}
                  </Link>
                </p>
                <div className="w-40 flex items-center justify-center">
                  {clan.createdAt
                    ? clan.createdAt.toLocaleDateString()
                    : t`N/A`}
                </div>
                <p className="w-20 text-center">{clan.xp}</p>
              </div>
            )
          })}
      </div>
    </RankingsLayout>
  )
}
