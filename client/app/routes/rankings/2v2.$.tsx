import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { Link, createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

import { get2v2Rankings } from '@/features/brawlhalla/api/functions';
import { RankingsTableItem } from '@/features/brawlhalla/components/stats/RankingsTableItem';
import { RankingsLayout } from '@/features/brawlhalla/components/stats/rankings/RankingsLayout';
import { getTeamPlayers } from '@/features/brawlhalla/helpers/teamPlayers';
import { cleanString } from '@/helpers/cleanString';
import { seo } from '@/helpers/seo';

export const Route = createFileRoute('/rankings/2v2/$')({
  component: RouteComponent,

  loader: async ({ params: { _splat } }) => {
    const [region, page = '1'] = _splat?.split('/') ?? [];
    const rankings = await get2v2Rankings({
      data: {
        region,
        page: z.coerce.number().min(1).max(1000).catch(1).parse(page),
      },
    });

    return {
      rankings,
      region,
      page,
    };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};

    const { region, page } = loaderData;

    const formatedRegion = region === 'all' ? t`Global` : region.toUpperCase();

    return {
      meta: seo({
        title: t`Brawlhalla ${formatedRegion} 2v2 Rankings - Page ${page} • Corehalla`,
        description: t`Brawhalla ${formatedRegion} 2v2 Rankings - Page ${page} • Corehalla`,
      }),
    };
  },
});

function RouteComponent() {
  const { region, page, rankings } = Route.useLoaderData();

  return (
    <RankingsLayout
      brackets={[
        { page: '1v1', label: t`1v1` },
        { page: '2v2', label: t`2v2` },
        { page: 'rotating', label: t`Rotating` },
        { page: 'power/1v1', label: t`Power 1v1` },
        { page: 'power/2v2', label: t`Power 2v2` },
        { page: 'clans', label: t`Clans` },
      ]}
      currentBracket="2v2"
      regions={[
        { page: 'all', label: t`Global` },
        { page: 'us-e', label: t`US-E` },
        { page: 'eu', label: t`EU` },
        { page: 'sea', label: t`SEA` },
        { page: 'brz', label: t`BRZ` },
        { page: 'aus', label: t`AUS` },
        { page: 'us-w', label: t`US-W` },
        { page: 'jpn', label: t`JPN` },
        { page: 'sa', label: t`SA` },
        { page: 'me', label: t`ME` },
      ]}
      currentRegion={region}
      currentPage={page}
      hasPagination
    >
      <div className="py-4 w-full h-full hidden md:flex items-center gap-4">
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
          <Trans>Player 1</Trans>
        </p>
        <p className="flex-1">
          <Trans>Player 2</Trans>
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
      <div className="rounded-lg overflow-hidden border border-border mb-4 flex flex-col">
        {rankings.map((team, i) => {
          const players = getTeamPlayers(team);
          if (!players) return null;

          const [player1, player2] = players;

          return (
            <RankingsTableItem
              key={`${player1.id}-${player2.id}`}
              index={i}
              content={
                <>
                  <p className="flex flex-1 items-center">
                    <Link to="/stats/player/$playerId" params={{ playerId: player1.id.toString() }}>
                      {cleanString(player1.name)}
                    </Link>
                  </p>
                  <p className="flex flex-1 items-center">
                    <Link to="/stats/player/$playerId" params={{ playerId: player2.id.toString() }}>
                      {cleanString(player2.name)}
                    </Link>
                  </p>
                </>
              }
              {...team}
            />
          );
        })}
      </div>
    </RankingsLayout>
  );
}
