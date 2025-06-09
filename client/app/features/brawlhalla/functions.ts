import { clanMock } from '@dair/brawlhalla-api/src/api/mocks/clan';
import { playerRankedMock } from '@dair/brawlhalla-api/src/api/mocks/player-ranked';
import { playerStatsMock } from '@dair/brawlhalla-api/src/api/mocks/player-stats';
import { powerRankingsMock } from '@dair/brawlhalla-api/src/api/mocks/power-rankings';
import { rankings1v1Mock } from '@dair/brawlhalla-api/src/api/mocks/rankings-1v1';
import { rankings2v2Mock } from '@dair/brawlhalla-api/src/api/mocks/rankings-2v2';
import { brawlhallaIdSchema } from '@dair/brawlhalla-api/src/api/schema/brawlhalla-id';
import { clanSchema } from '@dair/brawlhalla-api/src/api/schema/clan';
import type { PlayerRanked } from '@dair/brawlhalla-api/src/api/schema/player-ranked';
import { playerRankedSchema } from '@dair/brawlhalla-api/src/api/schema/player-ranked';
import { playerStatsSchema } from '@dair/brawlhalla-api/src/api/schema/player-stats';
import { powerRankingsSchema } from '@dair/brawlhalla-api/src/api/schema/power-rankings';
import type { Ranking1v1, Ranking2v2 } from '@dair/brawlhalla-api/src/api/schema/rankings';
import { ranking1v1Schema, ranking2v2Schema } from '@dair/brawlhalla-api/src/api/schema/rankings';
import { MAX_SHOWN_ALIASES } from '@dair/brawlhalla-api/src/constants/aliases';
import {
  powerRankedGameModeMap,
  powerRankedGameModeSchema,
} from '@dair/brawlhalla-api/src/constants/power/game-mode';
import {
  powerRankedOrderBySchema,
  powerRankedOrderSchema,
} from '@dair/brawlhalla-api/src/constants/power/order-by';
import { powerRankedRegionSchema } from '@dair/brawlhalla-api/src/constants/power/regions';
import { rankedRegionSchema } from '@dair/brawlhalla-api/src/constants/ranked/regions';
import { getTeamPlayers } from '@dair/brawlhalla-api/src/helpers/teamPlayers';
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';

import { env } from '@/env';
import { addOrUpdateAliases } from '@/features/archive/functions/aliases/add-update-aliases';
import { getAliases } from '@/features/archive/functions/aliases/get-aliases';
import { searchAliases } from '@/features/archive/functions/aliases/search-aliases';
import { addOrUpdateClans } from '@/features/archive/functions/clans/add-update-clans';
import { withCache } from '@/features/cache/cache';
import { cleanString } from '@dair/common/src/helpers/cleanString';
import { getDateFromUnixTime } from '@dair/common/src/helpers/date';

const BRAWLHALLA_API_BASE = 'https://api.brawlhalla.com';
const BRAWLTOOLS_API_BASE = 'https://api.brawltools.com';


export const getPlayerStats = createServerFn({ method: 'GET' })
  .validator(brawlhallaIdSchema)
  .handler(async ({ data: playerId }) => {
    const playerStats = await withCache(
      `player-stats-${playerId}`,
      () =>
        fetchApi({
          baseUrl: BRAWLHALLA_API_BASE,
          path: `/player/${playerId}/stats`,
          schema: playerStatsSchema,
          mock: playerStatsMock,
        }),
      env.CACHE_MAX_AGE_OVERRIDE ?? 15 * 60 * 1000
    );

    try {
      const updateAliasesQuery = addOrUpdateAliases({
        data: {
          serviceApiKey: env.SERVICE_API_KEY,
          aliases: [
            {
              playerId: playerId.toString(),
              alias: playerStats.name,
            },
          ],
        },
      });

      const updateClansQuery = playerStats.clan
        ? addOrUpdateClans({
            data: {
              serviceApiKey: env.SERVICE_API_KEY,
              clans: [
                {
                  id: playerStats.clan.clan_id.toString(),
                  name: cleanString(playerStats.clan.clan_name.trim()),
                  xp: z.coerce.number().catch(0).parse(playerStats.clan.clan_xp),
                },
              ],
            },
          })
        : null;

      await Promise.all([updateAliasesQuery, updateClansQuery]);
    } catch (e) {
      console.error('Failed to add alias - playerStats', e);
    }

    return playerStats;
  });

export const getPlayerRanked = createServerFn({ method: 'GET' })
  .validator(brawlhallaIdSchema)
  .handler(async ({ data: playerId }) => {
    const playerRanked = await withCache(
      `player-ranked-${playerId}`,
      () =>
        fetchApi({
          baseUrl: BRAWLHALLA_API_BASE,
          path: `/player/${playerId}/ranked`,
          schema: playerRankedSchema,
          mock: playerRankedMock,
        }) as unknown as Promise<PlayerRanked>, // TODO: Zod issue, it can't infer the type correctly
      env.IS_DEV ? 30 * 1000 : 15 * 60 * 1000
    );

    try {
      await addOrUpdateAliases({
        data: {
          serviceApiKey: env.SERVICE_API_KEY,
          aliases: [
            {
              playerId: playerId.toString(),
              alias: playerRanked.name,
            },
            ...playerRanked['2v2']
              .flatMap((team) => {
                const players = getTeamPlayers(team);
                if (!players) return null;
                const [player1, player2] = players;

                return [
                  {
                    playerId: player1.id.toString(),
                    alias: player1.name,
                  },
                  {
                    playerId: player2.id.toString(),
                    alias: player2.name,
                  },
                ];
              })
              .filter((player) => player !== null),
          ],
        },
      });
    } catch (e) {
      console.error('Failed to add aliases - playerRanked', e);
    }

    return playerRanked;
  });

export const getClan = createServerFn({ method: 'GET' })
  .validator(brawlhallaIdSchema)
  .handler(async ({ data: clanId }) => {
    const clan = await withCache(
      `clan-stats-${clanId}`,
      () =>
        fetchApi({
          baseUrl: BRAWLHALLA_API_BASE,
          path: `/clan/${clanId}`,
          schema: clanSchema,
          mock: clanMock,
        }),
      env.IS_DEV ? 30 * 1000 : 15 * 60 * 1000
    );

    try {
      const updateAliasesQuery = addOrUpdateAliases({
        data: {
          serviceApiKey: env.SERVICE_API_KEY,
          aliases: clan.clan.map((player) => {
            return {
              playerId: player.brawlhalla_id.toString(),
              alias: player.name,
            };
          }),
        },
      });

      const updateClansQuery = addOrUpdateClans({
        data: {
          serviceApiKey: env.SERVICE_API_KEY,
          clans: [
            {
              id: clan.clan_id.toString(),
              name: clan.clan_name,
              xp: z.coerce.number().catch(0).parse(clan.clan_xp),
              createdAt: getDateFromUnixTime(clan.clan_create_date),
            },
          ],
        },
      });

      await Promise.all([updateAliasesQuery, updateClansQuery]);
    } catch (e) {
      console.error('Failed to update aliases or clans - clan', e);
    }

    return clan;
  });

export const get1v1Rankings = createServerFn({ method: 'GET' })
  .validator(
    z.object({
      region: rankedRegionSchema,
      page: z.number().min(0).max(1000).default(1).catch(1),
      name: z.string().optional(),
    })
  )
  .handler(async ({ data: query }) => {
    const { region = 'all', page = 1, name } = query;

    const rankings = await withCache(
      `ranked-1v1-${region}-${page}-${name}`,
      () =>
        fetchApi({
          baseUrl: BRAWLHALLA_API_BASE,
          path: `/rankings/1v1/${region.toLowerCase()}/${page}${name ? `?name=${name}` : ''}`,
          schema: z.array(ranking1v1Schema),
          mock: rankings1v1Mock,
        }) as unknown as Promise<Ranking1v1[]>, // TODO: Zod issue, it can't infer the type correctly
      env.IS_DEV ? 30 * 1000 : 5 * 60 * 1000
    );

    try {
      await addOrUpdateAliases({
        data: {
          serviceApiKey: env.SERVICE_API_KEY,
          aliases: rankings.map((ranking) => ({
            playerId: ranking.brawlhalla_id.toString(),
            alias: ranking.name,
          })),
        },
      });
    } catch (e) {
      console.error('Failed to add aliases - 1v1 rankings', e);
    }

    return rankings;
  });

export const get2v2Rankings = createServerFn({ method: 'GET' })
  .validator(
    z.object({
      region: rankedRegionSchema,
      page: z.number().min(0).max(1000).default(1).catch(1),
    })
  )
  .handler(async ({ data: query }) => {
    const { region = 'all', page = 1 } = query;

    const rankings = await withCache(
      `ranked-2v2-${region}-${page}`,
      () =>
        fetchApi({
          baseUrl: BRAWLHALLA_API_BASE,
          path: `/rankings/2v2/${region.toLowerCase()}/${page}`,
          schema: z.array(ranking2v2Schema),
          mock: rankings2v2Mock,
        }) as unknown as Promise<Ranking2v2[]>, // TODO: Zod issue, it can't infer the type correctly
      env.IS_DEV ? 30 * 1000 : 5 * 60 * 1000
    );

    try {
      await addOrUpdateAliases({
        data: {
          serviceApiKey: env.SERVICE_API_KEY,
          aliases: rankings
            .flatMap((ranking) => {
              const players = getTeamPlayers(ranking);
              if (!players) return null;
              const [player1, player2] = players;

              return [
                {
                  playerId: player1.id.toString(),
                  alias: player1.name,
                },
                {
                  playerId: player2.id.toString(),
                  alias: player2.name,
                },
              ];
            })
            .filter((player) => player !== null),
        },
      });
    } catch (e) {
      console.error('Failed to add aliases - 2v2 rankings', e);
    }

    return rankings;
  });

export const searchPlayer = createServerFn({ method: 'GET' })
  .validator(z.string())
  .handler(async ({ data: name }) => {
    if (!name)
      return {
        rankings: [],
        aliases: [],
        potentialBrawlhallaIdPlayer: null,
      };

    const rankings = await get1v1Rankings({
      data: { region: 'all', page: 1, name },
    });

    const aliases = await searchAliases({
      data: { query: { player: name, limit: 5 } },
    });

    const isPotentialBrawlhallaId = z
      .string()
      .regex(/^[0-9]+$/)
      .safeParse(name).success;

    const potentialBrawlhallaIdAliases = isPotentialBrawlhallaId
      ? await getAliases({
          data: {
            query: {
              playerId: name,
              limit: MAX_SHOWN_ALIASES,
            },
          },
        })
      : null;

    return {
      rankings,
      aliases,
      potentialBrawlhallaIdAliases,
    };
  });

export const getPowerRankings = createServerFn({ method: 'GET' })
  .validator(
    z.object({
      region: powerRankedRegionSchema.transform((region) => region.toUpperCase()),
      page: z.number().min(0).max(1000).default(1).catch(1),
      orderBy: powerRankedOrderBySchema,
      order: powerRankedOrderSchema,
      gameMode: powerRankedGameModeSchema,
      player: z.string().optional(),
    })
  )
  .handler(async ({ data: query }) => {
    const { region, page, orderBy, order, gameMode, player } = query;

    const rankings = await withCache(
      `power-${gameMode}-${region}-${page}-${orderBy}-${order}`,
      () =>
        fetchApi({
          baseUrl: BRAWLTOOLS_API_BASE,
          path: '/pr',
          schema: powerRankingsSchema,
          mock: powerRankingsMock,
          init: {
            body: JSON.stringify({
              gameMode: powerRankedGameModeMap[gameMode],
              orderBy: `${orderBy} ${order}`,
              page,
              region,
              query: null,
              maxResults: 25,
            }),
            method: 'POST',
          },
        }),
      env.IS_DEV ? 30 * 1000 : 24 * 60 * 60 * 1000
    );

    return {
      rankings: rankings.prPlayers,
      updatedAt: rankings.lastUpdated,
      totalPage: rankings.totalPages,
      region,
      page,
      orderBy,
      order,
      gameMode,
      player,
    };
  });
