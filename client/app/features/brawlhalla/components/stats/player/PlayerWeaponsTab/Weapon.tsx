import { t } from '@lingui/core/macro';
import type { ReactNode } from 'react';

import { Card } from '@/components/base/Card';
import { WeaponIcon } from '@/features/brawlhalla/components/Image';
import type { FullWeapon } from '@dair/brawlhalla-api/src/helpers/parser';
import { formatTime } from '@dair/common/src/helpers/date';

import { CollapsibleContent } from '../../../layout/CollapsibleContent';
import { GamesDisplay } from '../../GamesDisplay';
import type { MiscStat } from '../../MiscStatGroup';
import { MiscStatGroup } from '../../MiscStatGroup';
import { PlayerWeaponRankedContent } from './RankedContent';

type Weapon = FullWeapon & {
  games: number;
  wins: number;
  level: number;
  xp: number;
  kos: number;
  damageDealt: number;
  matchtime: number;
};

interface WeaponProps {
  weapon: Weapon;
  matchtime: number;
  games: number;
  displayedInfoFn?: (weapon: Weapon) => ReactNode;
  rank: number;
}

export const Weapon = ({ weapon, matchtime, games, displayedInfoFn, rank }: WeaponProps) => {
  const { weapon: weaponName } = weapon;
  const weaponStats: MiscStat[] = [
    {
      name: t`Weapon level`,
      value: weapon.level,
      desc: t`Sum of the legends that use ${weaponName}`,
    },
    {
      name: t`Avg. legend level`,
      value: (weapon.level / weapon.legends.length).toFixed(0),
      desc: t`Avg. level of the legends that use ${weaponName}`,
    },
    {
      name: t`Weapon xp`,
      value: weapon.xp,
      desc: t`Sum of the legends that use ${weaponName}`,
    },
    {
      name: t`Avg. legend xp`,
      value: (weapon.xp / weapon.legends.length).toFixed(0),
      desc: t`Avg. xp of the legends that use ${weaponName}`,
    },
    {
      name: t`Time held`,
      value: `${formatTime(weapon.matchtime)}`,
      desc: t`Time ${weaponName} was held`,
    },
    {
      name: t`Time held (%)`,
      value: `${((weapon.matchtime / matchtime) * 100).toFixed(2)}%`,
      desc: t`Time ${weaponName} was held (percentage of total time)`,
    },
    {
      name: t`Usage rate (games)`,
      value: `${((weapon.games / games) * 100).toFixed(2)}%`,
      desc: t`${weaponName} usage rate (percentage of total games)`,
    },
    {
      name: t`KOs`,
      value: weapon.kos,
      desc: t`KOs with ${weaponName}`,
    },
    {
      name: t`Avg. Kos per game`,
      value: (weapon.kos / weapon.games).toFixed(2),
      desc: t`Average KOs per game with ${weaponName}`,
    },
    {
      name: t`Damage Dealt`,
      value: weapon.damageDealt,
      desc: t`Damage dealt with ${weaponName}`,
    },
    {
      name: t`DPS`,
      value: `${(weapon.damageDealt / weapon.matchtime).toFixed(2)} dmg/s`,
      desc: t`Damage dealt per second with ${weaponName}`,
    },
    {
      name: t`Avg. dmg dealt per game`,
      value: (weapon.damageDealt / weapon.games).toFixed(2),
      desc: t`Average damage dealt per game ${weaponName}`,
    },
  ];

  return (
    <CollapsibleContent
      key={weapon.weapon}
      className="shadow-md border rounded-lg border-border"
      triggerClassName="w-full p-4 flex justify-start items-center gap-2"
      contentClassName="px-4 pb-4"
      trigger={
        <span className="flex items-center justify-between w-full">
          <span className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{rank}</span>
            <WeaponIcon
              weapon={weapon.weapon}
              alt={weapon.weapon}
              Container="span"
              containerClassName="block w-6 h-6"
              className="object-contain object-center"
            />
            {weapon.weapon}
          </span>
          <span className="text-sm text-muted-foreground">{displayedInfoFn?.(weapon)}</span>
        </span>
      }
    >
      <Card title={t`Games`}>
        <GamesDisplay games={weapon.games} wins={weapon.wins} />
      </Card>
      <MiscStatGroup className="mt-4" stats={weaponStats} />
      <PlayerWeaponRankedContent weapon={weapon} />
    </CollapsibleContent>
  );
};
