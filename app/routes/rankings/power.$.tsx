import { t } from "@lingui/core/macro"
import { Trans } from "@lingui/react/macro"
import { createFileRoute, Link } from "@tanstack/react-router"
import { z } from "zod"

import { Tooltip } from "@/components/base/Tooltip"
import { getPowerRankings } from "@/features/brawlhalla/api/functions"
import {
  type MiscStat,
  MiscStatGroup,
} from "@/features/brawlhalla/components/stats/MiscStatGroup"
import { RankingsLayout } from "@/features/brawlhalla/components/stats/rankings/RankingsLayout"
import {
  powerRankedOrderBySchema,
  powerRankedOrderSchema,
} from "@/features/brawlhalla/constants/power/order-by"
import { cleanString } from "@/helpers/cleanString"
import { seo } from "@/helpers/seo"
import { useDebouncedState } from "@/hooks/useDebouncedState"
import { cn } from "@/ui/lib/utils"

export const Route = createFileRoute("/rankings/power/$")({
  component: RouteComponent,
  validateSearch: (search) =>
    z
      .object({
        orderBy: powerRankedOrderBySchema,
        order: powerRankedOrderSchema,
        player: z.string().optional(),
      })
      .parse(search),
  loaderDeps: ({ search: { player, orderBy, order } }) => ({
    player,
    orderBy,
    order,
  }),
  loader: async ({ params: { _splat }, deps: { player, orderBy, order } }) => {
    const [gameMode, region, page] = _splat?.split("/") ?? []
    const powerRankings = await getPowerRankings({
      data: {
        gameMode,
        region,
        page: z.coerce.number().min(1).max(1000).catch(1).parse(page),
        orderBy,
        order,
        player,
      },
    })

    return powerRankings
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {}

    const { region, page, player, gameMode } = loaderData

    const formattedRegion = region.toUpperCase()
    const formattedSearch = player ? ` - ${player}` : ""

    return {
      meta: seo({
        title: t`Brawlhalla ${formattedRegion} ${gameMode} Power Rankings Rankings - Page ${page} ${
          formattedSearch
        } • Corehalla`,
        description: t`Brawlhalla ${formattedRegion} ${gameMode} Power Rankings Rankings - Page ${page} ${
          formattedSearch
        } • Corehalla`,
      }),
    }
  },
})

// type PRSortOption =
//   | "rank"
//   | "name"
//   | "earnings"
//   | "t1"
//   | "t2"
//   | "t3"
//   | "t8"
//   | "t32"

function RouteComponent() {
  const { rankings, player, gameMode, region } = Route.useLoaderData()
  const [search, setSearch, immediateSearch] = useDebouncedState(
    player ?? "",
    500,
  )

  const filteredlPowerRankings =
    rankings.filter(({ playerName }) =>
      cleanString(playerName).toLowerCase().startsWith(search.toLowerCase()),
    ) ?? []

  const goldMedalists = filteredlPowerRankings.filter(({ gold }) => gold > 0)
  const silverMedalists = filteredlPowerRankings.filter(
    ({ silver }) => silver > 0,
  )
  const bronzeMedalists = filteredlPowerRankings.filter(
    ({ bronze }) => bronze > 0,
  )
  const podiumedPlayers = filteredlPowerRankings.filter(
    ({ gold, silver, bronze }) => gold + silver + bronze > 0,
  )
  const t8Finalists = filteredlPowerRankings.filter(({ top8 }) => top8 > 0)
  const t32Finalists = filteredlPowerRankings.filter(({ top32 }) => top32 > 0)

  const totalPlayers = filteredlPowerRankings.length
  const goldMedalistsCount = goldMedalists.length
  const silverMedalistsCount = silverMedalists.length
  const bronzeMedalistsCount = bronzeMedalists.length
  const podiumedPlayersCount = podiumedPlayers.length
  const t8FinalistsCount = t8Finalists.length
  const t32FinalistsCount = t32Finalists.length

  const formattedRegion = region.toUpperCase()
  const formattedSearch = search !== "" ? t`starting with ${search}` : ""

  const globalStats: MiscStat[] = [
    {
      name: t`Players ranked`,
      value: totalPlayers,
      desc: t`${totalPlayers} players ${formattedSearch} are currently power ranked`,
    },
    {
      name: t`Gold medalists`,
      value: goldMedalistsCount,
      desc: t`${goldMedalistsCount} players ${formattedSearch} have a gold medal`,
    },
    {
      name: t`Silver medalists`,
      value: silverMedalistsCount,
      desc: t`${silverMedalistsCount} players ${formattedSearch} have a silver medal`,
    },
    {
      name: t`Bronze medalists`,
      value: bronzeMedalistsCount,
      desc: t`${bronzeMedalistsCount} players ${formattedSearch} have a bronze medal`,
    },
    {
      name: t`Podiumed players`,
      value: podiumedPlayersCount,
      desc: t`${podiumedPlayersCount} players ${formattedSearch} have a podium`,
    },
    {
      name: t`Top 8 finalists`,
      value: t8FinalistsCount,
      desc: t`${t8FinalistsCount} players ${formattedSearch} have a top 8 finish`,
    },
    {
      name: t`Top 32 finalists`,
      value: t32FinalistsCount,
      desc: t`${t32FinalistsCount} players ${formattedSearch} have a top 32 finish`,
    },
  ]

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
      currentBracket={`power/${gameMode}`}
      regions={[
        { page: "na", label: "NA" },
        { page: "eu", label: "EU" },
        { page: "sea", label: "SEA" },
        { page: "sa", label: "SA" },
      ]}
      currentRegion={region}
      hasPagination
      hasSearch
      search={immediateSearch}
      setSearch={setSearch}
      searchPlaceholder={t`Search player...`}
      defaultRegion="na"
    >
      {/* <Select<PRSortOption>
        className="flex-1"
        onChange={setSortBy}
        value={sortBy}
        options={sortOptions}
      /> */}
      <MiscStatGroup className="mt-8 mb-4" stats={globalStats} />
      <div className="py-4 w-full h-full flex items-center gap-4">
        <p className="w-16 text-center">
          <Trans>Rank</Trans>
        </p>
        <p className="flex-1">
          <Trans>Name</Trans>
        </p>
        <p className="w-20">
          <Trans>Earnings</Trans>
        </p>
        <p className="w-16 text-center">
          <Trans>Gold</Trans>
        </p>
        <p className="w-16 text-center">
          <Trans>Silver</Trans>
        </p>
        <p className="w-16 text-center">
          <Trans>Bronze</Trans>
        </p>
        <p className="w-16 text-center">
          <Trans>Top 8</Trans>
        </p>
        <p className="w-16 text-center">
          <Trans>Top 32</Trans>
        </p>
      </div>
      {filteredlPowerRankings.length > 0 ? (
        <div className="rounded-lg overflow-hidden border border-bg mb-4">
          {filteredlPowerRankings.map((player, i) => (
            <div
              className={cn(
                "py-1 w-full h-full flex items-center gap-4 hover:bg-bg",
                {
                  "bg-bgVar2": i % 2 === 0,
                },
              )}
              key={`${gameMode}-${region}-${player.powerRanking}-${player.playerId}`}
            >
              <p className="w-16 text-center">{player.powerRanking}</p>
              <p className="flex-1">{cleanString(player.playerName)}</p>
              <p className="w-20">{player.earnings}</p>
              <p className="w-16 text-center">
                {player.gold ? `${player.gold} 🏆` : "-"}
              </p>
              <p className="w-16 text-center">
                {player.silver ? `${player.silver} 🥈` : "-"}
              </p>
              <p className="w-16 text-center">
                {player.bronze ? `${player.bronze} 🥉` : "-"}
              </p>
              <p className="w-16 text-center">{player.top8 || "-"}</p>
              <p className="w-16 text-center">{player.top32 || "-"}</p>
            </div>
          ))}
        </div>
      ) : (
        <Tooltip content={t`do better >:)`}>
          <div className="p-4 text-center text-textVar1">
            <Trans>
              No results found in {gameMode} {formattedRegion} Power Rankings
            </Trans>
          </div>
        </Tooltip>
      )}
    </RankingsLayout>
  )
}
