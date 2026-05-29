import { RankingsLayout } from "@/features/rankings/components/rankings-layout"
import { RankingsTableItem } from "@/features/rankings/components/rankings-table-item"
import {
  isRankingsRegion,
  parseRankingsPage,
} from "@/features/rankings/constants"
import { LegendIcon } from "@/shared/components/image"
import { ApiClient } from "@/shared/api-client"
import { legendsMap } from "@dair/brawlhalla-api"
import { cleanString } from "@dair/common/src/helpers/clean-string"
import { cn } from "@dair/common/src/helpers/ui"
import { t } from "@lingui/core/macro"
import { Trans } from "@lingui/react/macro"
import { Link, useNavigate } from "@tanstack/react-router"
import * as AsyncResult from "effect/unstable/reactivity/AsyncResult"
import { useAtomValue } from "@effect/atom-react"
import { useEffect, useState } from "react"

type Rankings1v1PageProps = {
  region: string
  page: string
  playerSearch?: string
}

export const Rankings1v1Page = ({
  region: regionParam,
  page: pageParam,
  playerSearch = "",
}: Rankings1v1PageProps) => {
  const navigate = useNavigate()
  const region = isRankingsRegion(regionParam) ? regionParam : "all"
  const page = parseRankingsPage(pageParam)
  const [search, setSearch] = useState(playerSearch)
  const [debouncedSearch, setDebouncedSearch] = useState(playerSearch)

  useEffect(() => {
    setSearch(playerSearch)
    setDebouncedSearch(playerSearch)
  }, [playerSearch])

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), 500)
    return () => clearTimeout(timeout)
  }, [search])

  useEffect(() => {
    void navigate({
      to: "/brawlhalla/rankings/1v1/$region/$page",
      params: { region, page: page.toString() },
      search: { player: debouncedSearch || undefined },
      replace: true,
    })
  }, [region, page, debouncedSearch, navigate])

  const rankingsResult = useAtomValue(
    ApiClient.query("brawlhalla", "get-ranked-1v1", {
      query: {
        region,
        page,
        name: debouncedSearch || undefined,
      },
      reactivityKeys: ["rankings-1v1", region, page, debouncedSearch],
    }),
  )

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">
          <Trans>1v1 rankings</Trans>
        </h1>
        <p className="text-sm text-text-muted">
          <Trans>Live ranked leaderboard by region</Trans>
        </p>
      </div>
      <RankingsLayout
        bracket="1v1"
        region={region}
        page={page}
        hasPagination={!debouncedSearch}
        hasSearch
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={t`Search player...`}
        searchSubtitle={t`Search must start with an exact match. Only players who completed placement matches are shown.`}
      >
        <div className="hidden items-center gap-4 py-4 md:flex">
          <p className="w-16 text-center">
            <Trans>Rank</Trans>
          </p>
          <p className="w-8 text-center">
            <Trans>Tier</Trans>
          </p>
          <p className="w-16 text-center">
            <Trans>Region</Trans>
          </p>
          <p className="flex-1">
            <Trans>Name</Trans>
          </p>
          <p className="w-16 text-center">
            <Trans>Games</Trans>
          </p>
          <p className="w-32 text-center">
            <Trans>W/L</Trans>
          </p>
          <p className="w-20 text-center">
            <Trans>Winrate</Trans>
          </p>
          <p className="w-40 pl-1">
            <Trans>Elo</Trans>
          </p>
        </div>
        {AsyncResult.builder(rankingsResult)
          .onInitialOrWaiting(() => (
            <div className="flex h-48 items-center justify-center text-text-muted">
              <Trans>Loading rankings...</Trans>
            </div>
          ))
          .onFailure(() => (
            <div className="flex h-48 items-center justify-center text-danger">
              <Trans>Failed to load rankings.</Trans>
            </div>
          ))
          .onSuccess(({ data: rankings }) => (
            <div className="mb-4 flex flex-col overflow-hidden rounded-lg border border-border">
              {rankings
                .filter((player) =>
                  player.name
                    .toLowerCase()
                    .startsWith(debouncedSearch.toLowerCase()),
                )
                .map((player, index) => {
                  const legend = player.best_legend
                    ? legendsMap[player.best_legend.id]
                    : undefined

                  return (
                    <RankingsTableItem
                      key={player.id}
                      index={index}
                      rank={player.rank}
                      region={player.region}
                      games={player.games}
                      wins={player.wins}
                      rating={player.rating}
                      peak_rating={player.peak_rating}
                      tier={player.tier}
                      content={
                        <Link
                          to="/brawlhalla/players/$playerId/overview"
                          params={{ playerId: player.slug }}
                          className="flex flex-1 items-center gap-2 md:gap-3"
                        >
                          {legend ? (
                            <LegendIcon
                              legendNameKey={legend.legend_name_key}
                              containerClassName="h-6 w-6 overflow-hidden rounded-lg"
                              className="object-cover object-center"
                            />
                          ) : null}
                          <span className={cn("truncate")}>
                            {cleanString(player.name)}
                          </span>
                        </Link>
                      }
                    />
                  )
                })}
            </div>
          ))
          .render()}
      </RankingsLayout>
    </div>
  )
}
