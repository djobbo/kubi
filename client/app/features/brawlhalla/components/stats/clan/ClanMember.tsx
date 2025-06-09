import { t } from '@lingui/core/macro';
import { Link } from '@tanstack/react-router';
import { Crown, Star, User, UserRoundPlus } from 'lucide-react';

import { Card } from '@/components/base/Card';
import type { Clan, ClanMemberRank } from '@dair/brawlhalla-api/src/api/schema/clan';
import { fixEncoding } from '@dair/common/src/helpers/fix-encoding';
import { formatUnixTime } from '@dair/common/src/helpers/date';

import type { MiscStat } from '../MiscStatGroup';
import { MiscStatGroup } from '../MiscStatGroup';

interface ClanMemberProps {
  member: Clan['clan'][number];
  clan: Clan;
}

const memberIcons: Record<ClanMemberRank, typeof Crown> = {
  Leader: Crown,
  Officer: Star,
  Member: User,
  Recruit: UserRoundPlus,
} as const;

export const ClanMember = ({ member, clan }: ClanMemberProps) => {
  const memberName = fixEncoding(member.name);

  const memberStats: MiscStat[] = [
    {
      name: t`Joined on`,
      value: formatUnixTime(member.join_date),
      desc: t`Date when ${memberName} joined the clan`,
    },
    {
      name: t`XP`,
      value: `${member.xp} (${((member.xp / parseInt(clan.clan_xp)) * 100).toFixed(2)}
                    %)`,
      desc: t`XP earned ${memberName} the member since joining the clan`,
    },
  ];

  const Icon = memberIcons[member.rank];

  return (
    <Link
      to={`/stats/player/$playerId`}
      params={{ playerId: member.brawlhalla_id.toString() }}
      key={member.brawlhalla_id}
    >
      <Card
        key={member.brawlhalla_id}
        title={
          <span className="flex items-center gap-1">
            <Icon size={12} />
            {fixEncoding(member.name)}
            <span className="text-xs text-muted-foreground">({member.rank})</span>
          </span>
        }
        className="hover:bg-secondary"
      >
        <MiscStatGroup
          className="mt-4 justify-items-center text-center"
          fit="fit"
          stats={memberStats}
        />
      </Card>
    </Link>
  );
};
