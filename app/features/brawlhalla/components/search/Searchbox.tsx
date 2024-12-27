import { usePlayerSearch } from "@hooks/stats/usePlayerSearch"
import { t } from "@lingui/core/macro"
import { Trans } from "@lingui/react/macro"
import { css } from "@stitches/react"
import { MAX_SHOWN_ALIASES } from "@util/constants"
import { trpc } from "@util/trpc"
import { gaEvent } from "common/analytics/gtag"
import {
  KBarAnimator,
  KBarPortal,
  KBarPositioner,
  KBarSearch,
  useKBar,
} from "kbar"
import { ArrowUp, UserRound } from "lucide-react"
import { useEffect, useState } from "react"
import { z } from "zod"

import { Spinner } from "@/components/base/Spinner"
import { cleanString } from "@/helpers/cleanString"
import { useDebouncedState } from "@/hooks/useDebouncedState"
import { cn } from "@/ui/lib/utils"
import { styled, theme } from "@/ui/theme"

import type { Ranking1v1 } from "../../api/schema/rankings"
import { RankedPlayerItem } from "./RankedPlayerItem"
import { SearchboxItem } from "./SearchboxItem"

const __DEV = process.env.NODE_ENV === "development"

const ResultsContainer = styled("div", {
  // eslint-disable-next-line lingui/no-unlocalized-strings
  maxHeight: "calc(100vh - 14vh - 100px)",
})

interface AliasesSubtitleProps {
  immediateSearch: string
  aliases?: string[]
}

const AliasesSubtitle = ({
  immediateSearch,
  aliases,
}: AliasesSubtitleProps) => {
  if (!aliases || aliases.length === 0) {
    return null
  }

  return (
    <span className="flex gap-1">
      {aliases.map((alias) => {
        const cleanAlias = cleanString(alias)

        if (cleanAlias.length < 2 || cleanAlias.endsWith("•2")) return

        return (
          <span
            key={cleanAlias}
            className={cn({
              "font-semibold": cleanAlias
                .toLowerCase()
                .startsWith(immediateSearch.toLowerCase()),
            })}
          >
            {cleanAlias}
          </span>
        )
      })}
    </span>
  )
}

export const Searchbox = () => {
  const [rankings, setRankings] = useState<Ranking1v1[]>([])
  const [search, setSearch, immediateSearch, isDebouncingSearch] =
    useDebouncedState("", __DEV ? 250 : 750)

  const { rankings1v1, aliases, isLoading } = usePlayerSearch(search)

  const isPotentialBrawlhallaId = z
    .string()
    .regex(/^[0-9]+$/)
    .safeParse(search).success

  const { data: potentialBrawlhallaIdAliases } = trpc.getPlayerAliases.useQuery(
    { playerId: search },
    {
      enabled: isPotentialBrawlhallaId,
    },
  )

  const {
    query: { toggle },
  } = useKBar()

  useEffect(() => {
    // open searchbox on "/"
    const onKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === "INPUT") return

      if (e.key === "/") {
        e.preventDefault()
        toggle()
      }
    }

    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [toggle])

  useEffect(() => {
    if (isLoading) return

    gaEvent({
      action: "use_searchbox",
      category: "app",
      label: `player ${search}`,
    })

    setRankings(rankings1v1 ?? [])
  }, [rankings1v1, isLoading, search])

  const filteredRankings = rankings.filter((player) =>
    player.name.toLowerCase().startsWith(immediateSearch.toLowerCase()),
  )

  const categoryTitleClassName = "text-xs font-semibold text-textVar1 px-4 py-2"

  return (
    <KBarPortal>
      <KBarPositioner className="z-20 bg-bgVar2/50">
        <KBarAnimator className="w-full max-w-screen-md">
          <div className="rounded-lg overflow-hidden mx-auto bg-bgVar2/[0.98] border border-bg">
            <div className="relative">
              <KBarSearch
                className="p-4 w-full bg-bgVar2 text-text outline-none border-b border-b-bg"
                defaultPlaceholder={t`Search player by name or brawlhalla id...`}
                onChange={(e) => {
                  setSearch(e.target.value)
                }}
                value={search}
              />
              {immediateSearch.length > 0 &&
                (isLoading || isDebouncingSearch) && (
                  <Spinner
                    className={cn(
                      "absolute",
                      css({
                        top: "50%",
                        right: "0.5rem",
                        transform: "translateY(-50%)",
                      })(),
                    )}
                    size="2rem"
                    color={theme.colors.bg.toString()}
                  />
                )}
            </div>
            {/* TODO: add tabs for searching for clans, tournaments, etc */}
            <ResultsContainer className="overflow-y-auto">
              <div className="max-h-[50vh] my-2">
                {immediateSearch &&
                (rankings.length > 0 ||
                  aliases.length > 0 ||
                  isPotentialBrawlhallaId) ? (
                  <>
                    {isPotentialBrawlhallaId && (
                      <>
                        <p className={categoryTitleClassName}>
                          <Trans>Search by Brawlhalla ID</Trans>
                        </p>
                        <SearchboxItem
                          icon={<UserRound />}
                          href={`/stats/player/${search}`}
                          title={t`Player#${search}`}
                          subtitle={
                            <AliasesSubtitle
                              immediateSearch={immediateSearch}
                              aliases={potentialBrawlhallaIdAliases?.slice(
                                0,
                                MAX_SHOWN_ALIASES,
                              )}
                            />
                          }
                        />
                      </>
                    )}
                    {filteredRankings.length > 0 && (
                      <>
                        <p className={categoryTitleClassName}>
                          <Trans>Ranked players</Trans>
                        </p>
                        {filteredRankings.map((player) => (
                          <RankedPlayerItem
                            key={player.brawlhalla_id}
                            player={player}
                          />
                        ))}
                      </>
                    )}
                    {aliases.length > 0 && (
                      <>
                        <p className={categoryTitleClassName}>
                          <Trans>Other players with similar names</Trans>
                        </p>
                        {aliases.map(
                          ({ playerId, mainAlias, otherAliases }) => (
                            <SearchboxItem
                              key={playerId}
                              icon={<UserRound className="w-8 h-8" />}
                              href={`/stats/player/${playerId}`}
                              title={cleanString(mainAlias)}
                              subtitle={
                                <AliasesSubtitle
                                  immediateSearch={immediateSearch}
                                  aliases={otherAliases}
                                />
                              }
                            />
                          ),
                        )}
                      </>
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-center px-4 py-8 w-full gap-2">
                    <ArrowUp className="w-4 h-4" />
                    <p className="text-center text-sm mx-4">
                      {!!immediateSearch &&
                        !isLoading &&
                        !isDebouncingSearch && (
                          <>
                            <span className="block text-lg font-semibold mb-2 text-text">
                              <Trans>No players found</Trans>
                            </span>
                          </>
                        )}
                      <Trans>
                        Search for a player (must start with exact match)
                      </Trans>
                      <br />
                      <span className="text-xs text-textVar1">
                        <Trans>
                          Only players that have completed their 10 placement
                          matches are shown.
                        </Trans>
                      </span>
                    </p>
                    <ArrowUp className="w-4 h-4" />
                  </div>
                )}
              </div>
            </ResultsContainer>
            <p className="text-center text-xs text-textVar1 italic p-2 border-t border-bg">
              <Trans>
                If you{"'"}re having trouble finding a player by name, trying
                using their brawlhalla id instead.
              </Trans>
              <br />
              <Trans>
                Join our{" "}
                <a
                  href="/discord"
                  target="_blank"
                  rel="noreferrer"
                  className="text-textVar1 underline"
                >
                  Discord
                </a>{" "}
                if you need help.
              </Trans>
            </p>
          </div>
        </KBarAnimator>
      </KBarPositioner>
    </KBarPortal>
  )
}
