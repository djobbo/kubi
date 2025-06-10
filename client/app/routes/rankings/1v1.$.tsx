import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { Link, createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

import { get1v1Rankings } from '@/features/brawlhalla/functions';
import { LegendIcon } from '@/features/brawlhalla/components/Image';
import { RankingsTableItem } from '@/features/brawlhalla/components/stats/RankingsTableItem';
import { RankingsLayout } from '@/features/brawlhalla/components/stats/rankings/RankingsLayout';
import { legendsMap } from '@dair/brawlhalla-api/src/constants/legends';
import { cleanString } from '@dair/common/src/helpers/clean-string';
import { seo } from '@dair/common/src/helpers/seo';

export const Route = createFileRoute('/rankings/1v1/$')({
  component: RouteComponent,
  validateSearch: (search) =>
    z
      .object({
        player: z.string().optional(),
      })
      .parse(search),
  loaderDeps: ({ search: { player } }) => ({ player }),
  loader: async ({ params: { _splat }, deps: { player } }) => {
    const [region, page = '1'] = _splat?.split('/') ?? [];
    const rankings = await get1v1Rankings({
      data: {
        region,
        page: z.coerce.number().min(1).max(1000).catch(1).parse(page),
        name: player,
      },
    });

    return {
      rankings,
      player,
      region,
      page,
    };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};

    const { region, page, player } = loaderData;

    const formatedRegion = region === 'all' ? t`Global` : region.toUpperCase();
    const formatedSearch = player ? ` - ${player}` : '';

    return {
      meta: seo({
        title: t`Brawlhalla ${formatedRegion} 1v1 Rankings - Page ${page} ${formatedSearch} • Corehalla`,
        description: t`Brawlhalla ${formatedRegion} 1v1 Rankings - Page ${page} ${formatedSearch} • Corehalla`,
      }),
    };
  },
});

function RouteComponent() {
  const {
    //  player,
    region,
    page,
    rankings,
  } = Route.useLoaderData();
  // const [search, setSearch, immediateSearch] = useDebouncedState(
  //   player ?? "",
  //   500,
  // )

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
      currentBracket="1v1"
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
      // hasPagination={!search}
      // hasSearch
      // search={immediateSearch}
      // setSearch={setSearch}
      hasPagination
      searchPlaceholder={t`Search player...`}
      searchSubtitle={t`Search must start with exact match. Only players that have completed their 10 placement matches are shown.`}
    >
      <div className="py-4 w-full h-full items-center gap-4 hidden md:flex">
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
          <Trans>Name</Trans>
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
        {rankings
          // .filter((player) =>
          //   player.name.toLowerCase().startsWith(immediateSearch),
          // )
          .map((player, i) => {
            const legend = legendsMap[player.best_legend];

            return (
              <RankingsTableItem
                key={player.brawlhalla_id}
                index={i}
                content={
                  <Link
                    to="/stats/player/$playerId"
                    params={{ playerId: player.brawlhalla_id.toString() }}
                    className="flex flex-1 items-center gap-2 md:gap-3"
                  >
                    {legend && (
                      <LegendIcon
                        legendNameKey={legend.legend_name_key}
                        alt={legend.bio_name}
                        containerClassName="w-6 h-6 rounded-lg overflow-hidden"
                        className="object-cover object-center"
                      />
                    )}
                    {cleanString(player.name)}
                  </Link>
                }
                {...player}
              />
            );
          })}
      </div>
    </RankingsLayout>
  );
}
