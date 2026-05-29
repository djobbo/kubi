import { calculateWinrate } from "@dair/brawlhalla-api"
import type { Player } from "@dair/api-contract/src/routes/v1/brawlhalla/get-player-by-id"
import { formatTime } from "@dair/common/src/helpers/date"
import { t } from "@lingui/core/macro"

import { SortDirection, useSortBy } from "../hooks/use-sort-by"
import { PlayerSortControls } from "./player-sort-controls"
import { WeaponCard } from "./weapon-card"

type PlayerWeaponsTabProps = {
  weapons: (typeof Player.Type)["weapons"]
  matchtime: number
  games: number
}

type PlayerWeapon = (typeof Player.Type)["weapons"][number]

type WeaponSortOption =
  | "name"
  | "xp"
  | "games"
  | "wins"
  | "losses"
  | "winrate"
  | "matchtime"

export const PlayerWeaponsTab = ({
  weapons,
  matchtime,
  games,
}: PlayerWeaponsTabProps) => {
  const {
    sortedArray: sortedWeapons,
    sortBy,
    setSortBy,
    options: sortOptions,
    sortDirection,
    changeSortDirection,
    displaySortFn,
  } = useSortBy<PlayerWeapon, WeaponSortOption>(
    weapons,
    {
      name: {
        label: t`Name`,
        sortFn: (a, b) => b.name.localeCompare(a.name),
      },
      xp: {
        label: t`Level / XP`,
        sortFn: (a, b) => a.stats.xp - b.stats.xp,
        displayFn: (weapon) => (
          <>
            {t`Level`} {weapon.stats.level} ({weapon.stats.xp} xp)
          </>
        ),
      },
      matchtime: {
        label: t`Matchtime`,
        sortFn: (a, b) => a.stats.time_held - b.stats.time_held,
        displayFn: (weapon) => <>{formatTime(weapon.stats.time_held)}</>,
      },
      games: {
        label: t`Games`,
        sortFn: (a, b) => a.stats.games - b.stats.games,
        displayFn: (weapon) => <>{weapon.stats.games} games</>,
      },
      wins: {
        label: t`Wins`,
        sortFn: (a, b) => a.stats.wins - b.stats.wins,
        displayFn: (weapon) => <>{weapon.stats.wins} wins</>,
      },
      losses: {
        label: t`Losses`,
        sortFn: (a, b) =>
          a.stats.games - a.stats.wins - (b.stats.games - b.stats.wins),
        displayFn: (weapon) => (
          <>{weapon.stats.games - weapon.stats.wins} losses</>
        ),
      },
      winrate: {
        label: t`Winrate`,
        sortFn: (a, b) =>
          calculateWinrate(a.stats.wins, a.stats.games) -
          calculateWinrate(b.stats.wins, b.stats.games),
        displayFn: (weapon) => (
          <>
            {calculateWinrate(weapon.stats.wins, weapon.stats.games).toFixed(2)}
            % winrate
          </>
        ),
      },
    },
    "matchtime",
    SortDirection.Descending,
  )

  return (
    <>
      <PlayerSortControls
        className="mt-4 w-full"
        sortBy={sortBy}
        onSortByChange={setSortBy}
        options={sortOptions}
        sortDirection={sortDirection}
        onSortDirectionChange={changeSortDirection}
      />
      <div className="mt-4 flex flex-col gap-4">
        {sortedWeapons.map((weapon, index) => (
          <WeaponCard
            key={weapon.name}
            weapon={weapon}
            matchtime={matchtime}
            games={games}
            sortSummary={displaySortFn?.(weapon)}
            rank={
              sortDirection === SortDirection.Ascending
                ? sortedWeapons.length - index
                : index + 1
            }
          />
        ))}
      </div>
    </>
  )
}
