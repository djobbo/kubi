import { t } from "@lingui/core/macro"
import { Trans } from "@lingui/react/macro"
import { queryOptions, useQuery } from "@tanstack/react-query"
import {
  KBarAnimator,
  KBarPortal,
  KBarPositioner,
  KBarSearch,
  useKBar,
} from "kbar"
import { ArrowUp, UserRound } from "lucide-react"
import { useEffect } from "react"

import { Spinner } from "@/components/base/Spinner"
import { env } from "@/env"
import { cleanString } from "@/helpers/cleanString"
import { useDebouncedState } from "@/hooks/useDebouncedState"
import { css } from "@/panda/css"
import { cn } from "@/ui/lib/utils"
import { colors } from "@/ui/theme"

import { searchPlayer } from "../../api/functions"
import { MAX_SHOWN_ALIASES } from "../../constants/aliases"
import { RankedPlayerItem } from "./RankedPlayerItem"
import { SearchboxItem } from "./SearchboxItem"

const resultsContainerClass = css({
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

export const usePlayerSearch = (name: string) => {
  return useQuery(
    queryOptions({
      queryKey: ["player-search", name],
      queryFn: async () => {
        const search = await searchPlayer({
          data: name,
        })

        return search
      },
    }),
  )
}

export const Searchbox = () => {
  const [search, setSearch, immediateSearch, isDebouncingSearch] =
    useDebouncedState("", env.IS_DEV ? 250 : 750)

  const playerSearchQuery = usePlayerSearch(search)

  const { data, isLoading } = playerSearchQuery
  const {
    rankings = [],
    aliases = [],
    potentialBrawlhallaIdAliases = null,
  } = data ?? {}

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

  const filteredRankings =
    rankings?.filter((player) =>
      player.name.toLowerCase().startsWith(immediateSearch.toLowerCase()),
    ) ?? []

  const hasResults =
    filteredRankings.length > 0 ||
    aliases.length > 0 ||
    !!potentialBrawlhallaIdAliases

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
                    className="absolute top-1/2 -translate-x-1/2 right-2"
                    size="2rem"
                    color={colors.bg}
                  />
                )}
            </div>
            {/* TODO: add tabs for searching for clans, tournaments, etc */}
            <div className={cn(resultsContainerClass, "overflow-y-auto")}>
              <div className="max-h-[50vh] my-2">
                {hasResults ? (
                  <>
                    {potentialBrawlhallaIdAliases && (
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
                              aliases={potentialBrawlhallaIdAliases
                                ?.slice(0, MAX_SHOWN_ALIASES)
                                .map((alias) => alias.alias)}
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
                            key={`ranking-${player.brawlhalla_id}-${player.name}`}
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
                        {aliases.map(({ playerId, alias, otherAliases }) => (
                          <SearchboxItem
                            key={`alias-${playerId}-${alias}`}
                            icon={<UserRound className="w-8 h-8" />}
                            href={`/stats/player/${playerId}`}
                            title={cleanString(alias)}
                            subtitle={
                              <AliasesSubtitle
                                immediateSearch={immediateSearch}
                                aliases={otherAliases}
                              />
                            }
                          />
                        ))}
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
            </div>
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
