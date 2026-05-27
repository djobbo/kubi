import { RankingsLayout } from "@/features/rankings/components/rankings-layout"
import { RankingsTableItem } from "@/features/rankings/components/rankings-table-item"
import {
  isRankingsRegion,
  parseRankingsPage,
} from "@/features/rankings/constants"
import { ApiClient } from "@/shared/api-client"
import { cleanString } from "@dair/common/src/helpers/clean-string"
import { cn } from "@dair/common/src/helpers/ui"
import { Trans } from "@lingui/react/macro"
import { Link } from "@tanstack/react-router"
import * as AsyncResult from "effect/unstable/reactivity/AsyncResult"
import { useAtomValue } from "@effect/atom-react"

type Rankings2v2PageProps = {
  region: string
  page: string
}

export const Rankings2v2Page = ({
  region: regionParam,
  page: pageParam,
}: Rankings2v2PageProps) => {
  const region = isRankingsRegion(regionParam) ? regionParam : "all"
  const page = parseRankingsPage(pageParam)

  const rankingsResult = useAtomValue(
    ApiClient.query("brawlhalla", "get-ranked-2v2", {
      query: { region, page },
      reactivityKeys: ["rankings-2v2", region, page],
    }),
  )

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">
          <Trans>2v2 rankings</Trans>
        </h1>
        <p className="text-sm text-text-muted">
          <Trans>Live 2v2 ranked teams by region</Trans>
        </p>
      </div>
      <RankingsLayout
        bracket="2v2"
        region={region}
        page={page}
        hasPagination
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
            <Trans>Team</Trans>
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
              {rankings.map((entry, index) => {
                const [playerOne, playerTwo] = entry.team

                return (
                  <RankingsTableItem
                    key={`${playerOne.id}-${playerTwo.id}-${entry.rank}`}
                    index={index}
                    rank={entry.rank}
                    region={entry.region}
                    games={entry.games}
                    wins={entry.wins}
                    rating={entry.rating}
                    peak_rating={entry.peak_rating}
                    tier={entry.tier}
                    content={
                      <div className="flex flex-1 flex-col gap-1 md:flex-row md:items-center md:gap-3">
                        <Link
                          to="/brawlhalla/players/$playerId/overview"
                          params={{ playerId: playerOne.slug }}
                          className={cn("truncate hover:underline")}
                        >
                          {cleanString(playerOne.name)}
                        </Link>
                        <span className="hidden text-text-muted md:inline">
                          +
                        </span>
                        <Link
                          to="/brawlhalla/players/$playerId/overview"
                          params={{ playerId: playerTwo.slug }}
                          className={cn("truncate hover:underline")}
                        >
                          {cleanString(playerTwo.name)}
                        </Link>
                      </div>
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
