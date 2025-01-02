import { t } from "@lingui/core/macro"
import { Trans } from "@lingui/react/macro"
import { ArrowDownWideNarrow, ArrowUpWideNarrow } from "lucide-react"
import { useMemo, useState } from "react"

import { Select } from "@/components/base/Select"
import { type Weapon, weapons } from "@/features/brawlhalla/constants/weapons"
import type { FullLegend } from "@/features/brawlhalla/helpers/parser"
import { calculateWinrate } from "@/features/brawlhalla/helpers/winrate"
import { formatTime } from "@/helpers/date"
import { SortDirection, useSortBy } from "@/hooks/useSortBy"

import type { MiscStat } from "../../MiscStatGroup"
import { MiscStatGroup } from "../../MiscStatGroup"
import { Legend } from "./Legend"

interface PlayerLegendsTabProps {
  legends: FullLegend[]
  matchtime: number
  games: number
}

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
  const [weaponFilter, setWeaponFilter] = useState<Weapon | "">("")
  const {
    sortedArray: sortedLegends,
    sortBy: legendSortBy,
    setSortBy: sortLegendBy,
    options: legendSortOptions,
    changeSortDirection: changeLegendSortDirection,
    sortDirection: legendSortDirection,
    displaySortFn: displayLegendSortFn,
  } = useSortBy<FullLegend, LegendSortOption>(
    legends,
    {
      name: {
        label: t`Name`,
        sortFn: (a, b) => b.bio_name.localeCompare(a.bio_name),
      },
      xp: {
        label: t`Level / XP`,
        sortFn: (a, b) => (a.stats?.xp ?? 0) - (b.stats?.xp ?? 0),
        displayFn: (legend) => (
          <Trans>
            Level {legend.stats?.level ?? 0} ({legend.stats?.xp ?? 0} xp)
          </Trans>
        ),
      },
      matchtime: {
        label: t`Matchtime`,
        sortFn: (a, b) => (a.stats?.matchtime ?? 0) - (b.stats?.matchtime ?? 0),
        displayFn: (legend) => <>{formatTime(legend.stats?.matchtime ?? 0)}</>,
      },
      games: {
        label: t`Games`,
        sortFn: (a, b) => (a.stats?.games ?? 0) - (b.stats?.games ?? 0),
        displayFn: (legend) => <>{legend.stats?.games ?? 0} games</>,
      },
      wins: {
        label: t`Wins`,
        sortFn: (a, b) => (a.stats?.wins ?? 0) - (b.stats?.wins ?? 0),
        displayFn: (legend) => <>{legend.stats?.wins ?? 0} wins</>,
      },
      losses: {
        label: t`Losses`,
        sortFn: (a, b) =>
          (a.stats?.games ?? 0) -
          (a.stats?.wins ?? 0) -
          ((b.stats?.games ?? 0) - (b.stats?.wins ?? 0)),
        displayFn: (legend) => (
          <>{(legend.stats?.games ?? 0) - (legend.stats?.wins ?? 0)} losses</>
        ),
      },
      winrate: {
        label: t`Winrate`,
        sortFn: (a, b) =>
          calculateWinrate(a.stats?.wins ?? 0, a.stats?.games ?? 0) -
          calculateWinrate(b.stats?.wins ?? 0, b.stats?.games ?? 0),
        displayFn: (legend) => (
          <Trans>
            {calculateWinrate(
              legend.stats?.wins ?? 0,
              legend.stats?.games ?? 0,
            ).toFixed(2)}
            % winrate
          </Trans>
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
        displayFn: (legend) => (
          <Trans>{legend.ranked?.peak_rating ?? 0} peak elo</Trans>
        ),
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
          [legend.weapon_one, legend.weapon_two].includes(weaponFilter),
      ),
    [sortedLegends, weaponFilter],
  )

  const globalLegendsStats: MiscStat[] = [
    {
      name: t`Legends played`,
      value: (
        <>
          {
            filteredLegends.filter(
              (legend) => legend.stats && legend.stats.matchtime > 0,
            ).length
          }{" "}
          / {filteredLegends.length}
        </>
      ),
      desc: t`Legends that were played at least once`,
    },
    {
      name: t`Played in ranked`,
      value: (
        <>
          {filteredLegends.filter(
            (legend) => legend.ranked && legend.ranked.games > 0,
          ).length ?? 0}{" "}
          / {filteredLegends.length}
        </>
      ),
      desc: t`Legends that were played at least once in ranked 1v1 during this season`,
    },
    {
      name: t`Total legends level`,
      value: filteredLegends.reduce(
        (level, legend) => level + (legend.stats?.level ?? 0),
        0,
      ),
      desc: t`Sum of of all legends`,
    },
    {
      name: t`Avg. level`,
      value: (
        filteredLegends.reduce(
          (level, legend) => level + (legend.stats?.level ?? 0),
          0,
        ) / filteredLegends.length
      ).toFixed(0),
      desc: t`Average level of all legends`,
    },
  ]

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-8 items-center w-full">
        <Select<Weapon | "">
          className="flex-1 w-full"
          onChange={setWeaponFilter}
          value={weaponFilter}
          options={[
            {
              label: "All Weapons",
              value: "",
            },
            ...weapons.map((weapon) => ({
              label: weapon,
              value: weapon,
            })),
          ]}
          label="Filter by weapon"
        />
        <div className="flex-1 flex gap-4 items-center w-full">
          <Select<LegendSortOption>
            className="flex-1"
            onChange={sortLegendBy}
            value={legendSortBy}
            options={legendSortOptions}
            label="Sort by"
          />
          <button
            type="button"
            onClick={changeLegendSortDirection}
            className="flex items-center hover:text-accentOld"
          >
            {legendSortDirection === SortDirection.Ascending ? (
              <ArrowUpWideNarrow className="w-6 h-6" />
            ) : (
              <ArrowDownWideNarrow className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>
      <MiscStatGroup className="mt-8" stats={globalLegendsStats} />
      <div className="flex flex-col gap-2 mt-8">
        {filteredLegends.map((legend, i) => (
          <Legend
            key={legend.legend_id}
            legend={legend}
            matchtime={matchtime}
            games={games}
            displayedInfoFn={displayLegendSortFn}
            rank={
              legendSortDirection === SortDirection.Ascending
                ? filteredLegends.length - i
                : i + 1
            }
          />
        ))}
      </div>
    </>
  )
}
