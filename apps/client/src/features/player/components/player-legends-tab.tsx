import { StatGrid } from "@/shared/components/stat-grid"
import { calculateWinrate } from "@dair/brawlhalla-api"
import type { Player } from "@dair/api-contract/src/routes/v1/brawlhalla/get-player-by-id"
import { formatTime } from "@dair/common/src/helpers/date"
import { cn } from "@dair/common/src/helpers/ui"
import { t } from "@lingui/core/macro"
import { Select } from "@base-ui-components/react/select"
import { CheckIcon, ChevronDownIcon } from "lucide-react"
import { useMemo, useState } from "react"

import { SortDirection, useSortBy } from "../hooks/use-sort-by"
import { LegendCard } from "./legend-card"
import { PlayerSortControls } from "./player-sort-controls"

type PlayerLegendsTabProps = {
  legends: (typeof Player.Type)["legends"]
  matchtime: number
  games: number
}

type PlayerLegend = (typeof Player.Type)["legends"][number]

type LegendSortOption =
  | "name"
  | "xp"
  | "games"
  | "wins"
  | "losses"
  | "winrate"
  | "rating"
  | "peak_rating"
  | "matchtime"

export const PlayerLegendsTab = ({
  legends,
  matchtime,
  games,
}: PlayerLegendsTabProps) => {
  const weaponOptions = useMemo(() => {
    const names = new Set<string>()
    for (const legend of legends) {
      names.add(legend.weapon_one.name)
      names.add(legend.weapon_two.name)
    }
    return [
      { label: t`All weapons`, value: "" },
      ...[...names].sort().map((name) => ({ label: name, value: name })),
    ]
  }, [legends])

  const [weaponFilter, setWeaponFilter] = useState("")

  const {
    sortedArray: sortedLegends,
    sortBy,
    setSortBy,
    options: sortOptions,
    sortDirection,
    changeSortDirection,
    displaySortFn,
  } = useSortBy<PlayerLegend, LegendSortOption>(
    legends,
    {
      name: {
        label: t`Name`,
        sortFn: (a, b) => b.name.localeCompare(a.name),
      },
      xp: {
        label: t`Level / XP`,
        sortFn: (a, b) => a.stats.xp - b.stats.xp,
        displayFn: (legend) => (
          <>
            {t`Level`} {legend.stats.level} ({legend.stats.xp} xp)
          </>
        ),
      },
      matchtime: {
        label: t`Matchtime`,
        sortFn: (a, b) => a.stats.matchtime - b.stats.matchtime,
        displayFn: (legend) => <>{formatTime(legend.stats.matchtime)}</>,
      },
      games: {
        label: t`Games`,
        sortFn: (a, b) => a.stats.games - b.stats.games,
        displayFn: (legend) => <>{legend.stats.games} games</>,
      },
      wins: {
        label: t`Wins`,
        sortFn: (a, b) => a.stats.wins - b.stats.wins,
        displayFn: (legend) => <>{legend.stats.wins} wins</>,
      },
      losses: {
        label: t`Losses`,
        sortFn: (a, b) =>
          a.stats.games - a.stats.wins - (b.stats.games - b.stats.wins),
        displayFn: (legend) => (
          <>{legend.stats.games - legend.stats.wins} losses</>
        ),
      },
      winrate: {
        label: t`Winrate`,
        sortFn: (a, b) =>
          calculateWinrate(a.stats.wins, a.stats.games) -
          calculateWinrate(b.stats.wins, b.stats.games),
        displayFn: (legend) => (
          <>
            {calculateWinrate(legend.stats.wins, legend.stats.games).toFixed(2)}%
            winrate
          </>
        ),
      },
      rating: {
        label: t`Elo`,
        sortFn: (a, b) => (a.ranked?.rating ?? 0) - (b.ranked?.rating ?? 0),
        displayFn: (legend) => <>{legend.ranked?.rating ?? 0} elo</>,
      },
      peak_rating: {
        label: t`Peak elo`,
        sortFn: (a, b) =>
          (a.ranked?.peak_rating ?? 0) - (b.ranked?.peak_rating ?? 0),
        displayFn: (legend) => <>{legend.ranked?.peak_rating ?? 0} peak elo</>,
      },
    },
    "xp",
    SortDirection.Descending,
  )

  const filteredLegends = useMemo(
    () =>
      sortedLegends.filter(
        (legend) =>
          !weaponFilter ||
          legend.weapon_one.name === weaponFilter ||
          legend.weapon_two.name === weaponFilter,
      ),
    [sortedLegends, weaponFilter],
  )

  const playedCount = filteredLegends.filter(
    (legend) => legend.stats.matchtime > 0,
  ).length

  return (
    <>
      <div className="mt-4 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center">
        <Select.Root
          items={weaponOptions}
          value={weaponFilter}
          onValueChange={(value) => setWeaponFilter(value ?? "")}
        >
          <Select.Trigger
            className={cn(
              "flex h-10 w-full flex-1 items-center justify-between gap-3",
              "rounded-md border border-border bg-bg px-3.5 sm:max-w-xs",
            )}
          >
            <Select.Value className="text-sm">
              {weaponOptions.find(({ value }) => value === weaponFilter)?.label}
            </Select.Value>
            <Select.Icon className="flex">
              <ChevronDownIcon className="size-4" />
            </Select.Icon>
          </Select.Trigger>
          <Select.Portal>
            <Select.Positioner
              className="z-20 outline-none select-none"
              sideOffset={8}
            >
              <Select.Popup className="corner-smooth-md bg-bg-root outline-1 outline-border">
                <Select.List className="relative scroll-py-6 overflow-y-auto py-1">
                  {weaponOptions.map(({ label, value }) => (
                    <Select.Item
                      key={value || "all"}
                      value={value}
                      className={cn(
                        "grid cursor-default grid-cols-[0.75rem_1fr] items-center gap-2 py-2 pr-4 pl-2.5 text-sm leading-4 outline-none select-none",
                        "data-[highlighted]:before:absolute data-[highlighted]:before:inset-x-1 data-[highlighted]:before:inset-y-0 data-[highlighted]:before:z-[-1] data-[highlighted]:before:rounded-sm data-[highlighted]:before:bg-bg-light",
                      )}
                    >
                      <Select.ItemIndicator className="col-start-1">
                        <CheckIcon className="size-3" />
                      </Select.ItemIndicator>
                      <Select.ItemText className="col-start-2">
                        {label}
                      </Select.ItemText>
                    </Select.Item>
                  ))}
                </Select.List>
              </Select.Popup>
            </Select.Positioner>
          </Select.Portal>
        </Select.Root>
        <PlayerSortControls
          sortBy={sortBy}
          onSortByChange={setSortBy}
          options={sortOptions}
          sortDirection={sortDirection}
          onSortDirectionChange={changeSortDirection}
        />
      </div>
      <StatGrid
        className="mt-6"
        stats={[
          {
            title: t`Legends played`,
            value: `${playedCount} / ${filteredLegends.length}`,
          },
          {
            title: t`Played in ranked`,
            value: `${
              filteredLegends.filter((l) => l.ranked && l.ranked.games > 0)
                .length
            } / ${filteredLegends.length}`,
          },
          {
            title: t`Total legends level`,
            value: filteredLegends
              .reduce((sum, l) => sum + l.stats.level, 0)
              .toLocaleString(),
          },
          {
            title: t`Avg. level`,
            value: (
              filteredLegends.reduce((sum, l) => sum + l.stats.level, 0) /
              filteredLegends.length
            ).toFixed(0),
          },
        ]}
      />
      <div className="mt-6 flex flex-col gap-4">
        {filteredLegends.map((legend, index) => (
          <LegendCard
            key={legend.id}
            legend={legend}
            matchtime={matchtime}
            games={games}
            sortSummary={displaySortFn?.(legend)}
            rank={
              sortDirection === SortDirection.Ascending
                ? filteredLegends.length - index
                : index + 1
            }
          />
        ))}
      </div>
    </>
  )
}
