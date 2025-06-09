import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { ArrowDownWideNarrow, ArrowUpWideNarrow } from 'lucide-react';
import { useMemo } from 'react';

import { Select } from '@/components/base/Select';
import type { FullWeapon } from '@dair/brawlhalla-api/src/helpers/parser';
import { getWeaponsAccumulativeData } from '@dair/brawlhalla-api/src/helpers/parser';
import { calculateWinrate } from '@dair/brawlhalla-api/src/helpers/winrate';
import { formatTime } from '@dair/common/src/helpers/date';
import { SortDirection, useSortBy } from '@/hooks/useSortBy';

import { Weapon } from './Weapon';

interface PlayerWeaponsTabProps {
  weapons: FullWeapon[];
  matchtime: number;
  games: number;
}

type WeaponSortOption = 'name' | 'xp' | 'games' | 'wins' | 'losses' | 'winrate' | 'matchtime';

export const PlayerWeaponsTab = ({ weapons, matchtime, games }: PlayerWeaponsTabProps) => {
  const weaponsStats = useMemo(() => getWeaponsAccumulativeData(weapons), [weapons]);

  const {
    sortedArray: sortedWeapons,
    sortBy: weaponSortBy,
    setSortBy: sortWeaponBy,
    options: weaponSortOptions,
    changeSortDirection: changeWeaponSortDirection,
    sortDirection: weaponSortDirection,
    displaySortFn: displayWeaponSortFn,
  } = useSortBy<(typeof weaponsStats)[number], WeaponSortOption>(
    weaponsStats,
    {
      name: {
        label: t`Name`,
        sortFn: (a, b) => b.weapon.localeCompare(a.weapon),
      },
      xp: {
        label: t`Level / XP`,
        sortFn: (a, b) => a.xp - b.xp,
        displayFn: (weapon) => (
          <Trans>
            Level {weapon.level ?? 0} ({weapon.xp ?? 0} xp)
          </Trans>
        ),
      },
      matchtime: {
        label: t`Matchtime`,
        sortFn: (a, b) => (a.matchtime ?? 0) - (b.matchtime ?? 0),
        displayFn: (weapon) => <>{formatTime(weapon.matchtime ?? 0)}</>,
      },
      games: {
        label: t`Games`,
        sortFn: (a, b) => (a.games ?? 0) - (b.games ?? 0),
        displayFn: (weapon) => <>{weapon.games ?? 0} games</>,
      },
      wins: {
        label: t`Wins`,
        sortFn: (a, b) => (a.wins ?? 0) - (b.wins ?? 0),
        displayFn: (weapon) => <>{weapon.wins ?? 0} wins</>,
      },
      losses: {
        label: t`Losses`,
        sortFn: (a, b) => (a.games ?? 0) - (a.wins ?? 0) - ((b.games ?? 0) - (b.wins ?? 0)),
        displayFn: (weapon) => <>{(weapon.games ?? 0) - (weapon.wins ?? 0)} losses</>,
      },
      winrate: {
        label: t`Winrate`,
        sortFn: (a, b) =>
          calculateWinrate(a.wins ?? 0, a.games ?? 0) - calculateWinrate(b.wins ?? 0, b.games ?? 0),
        displayFn: (weapon) => (
          <Trans>{calculateWinrate(weapon.wins ?? 0, weapon.games ?? 0).toFixed(2)}% winrate</Trans>
        ),
      },
    },
    'matchtime',
    SortDirection.Descending
  );

  return (
    <>
      <div className="mt-14 flex-1 flex gap-4 items-center w-full">
        <Select<WeaponSortOption>
          className="flex-1"
          onChange={sortWeaponBy}
          value={weaponSortBy}
          options={weaponSortOptions}
          label="Sort by"
        />
        <button
          type="button"
          onClick={changeWeaponSortDirection}
          className="flex items-center hover:text-accent-foreground"
        >
          {weaponSortDirection === SortDirection.Ascending ? (
            <ArrowUpWideNarrow className="w-6 h-6" />
          ) : (
            <ArrowDownWideNarrow className="w-6 h-6" />
          )}
        </button>
      </div>
      <div className="flex flex-col gap-2 mt-4">
        {sortedWeapons.map((weapon, i) => (
          <Weapon
            key={weapon.weapon}
            weapon={weapon}
            matchtime={matchtime}
            games={games}
            displayedInfoFn={displayWeaponSortFn}
            rank={
              weaponSortDirection === SortDirection.Ascending ? sortedWeapons.length - i : i + 1
            }
          />
        ))}
      </div>
    </>
  );
};
