import {
  clanMock,
  playerRankedMock,
  playerStatsMock,
  rankings1v1Mock,
  rankings2v2Mock,
} from './mocks';
import { clanSchema } from '@dair/brawlhalla-api/src/api/schema/clan';
import { playerRankedSchema } from '@dair/brawlhalla-api/src/api/schema/player-ranked';
import { playerStatsSchema } from '@dair/brawlhalla-api/src/api/schema/player-stats';
import { ranking1v1Schema, ranking2v2Schema } from '@dair/brawlhalla-api/src/api/schema/rankings';
import { withCache } from '../../helpers/with-cache';
import { getTeamPlayers } from '@dair/brawlhalla-api/src/helpers/team-players';

import { typesafeFetch } from '../../helpers/typesafe-fetch';
import z from 'zod';
import { env } from '../../env';
import { aliasesService } from '../aliases';

const BRAWLHALLA_API_URL = 'https://api.brawlhalla.com';

const DEFAULT_RANKINGS_REGION = 'all';
const DEFAULT_RANKINGS_PAGE = 1;

const fetchBrawlhallaApi = typesafeFetch('Brawlhalla API', BRAWLHALLA_API_URL, {
  api_key: env.BRAWLHALLA_API_KEY,
});

export const brawlhallaService = {
  getPlayerStatsById: async (playerId: string) => {
    const fetchPlayerStats = async () => {
      const playerStats = await fetchBrawlhallaApi({
        path: `/player/${playerId}/stats`,
        schema: playerStatsSchema,
        mock: playerStatsMock,
      })

    const now = new Date()
    await aliasesService.updateAliases([
      {
        playerId: playerId.toString(),
        alias: playerStats.name,
        updatedAt: now,
      },
    ]);

    return playerStats;
  }

    const playerStats = await withCache(`brawlhalla-player-stats-${playerId}`, fetchPlayerStats, env.CACHE_MAX_AGE_OVERRIDE ?? 15 * 60 * 1000)

    return playerStats
  },
  getPlayerRankedById: async (playerId: string) => {
    const fetchPlayerRanked = async () => {
      const playerRanked = await fetchBrawlhallaApi({
        path: `/player/${playerId}/ranked`,
        schema: playerRankedSchema,
        mock: playerRankedMock,
      })


      const now = new Date()
      await aliasesService.updateAliases([
        {
          playerId: playerId.toString(),
          alias: playerRanked.name,
          updatedAt: now,
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
                    updatedAt: now,
                  },
                  {
                    playerId: player2.id.toString(),
                    alias: player2.name,
                    updatedAt: now,
                  },
                ];
              })
              .filter((player) => player !== null),
      ]);

      return playerRanked;
    }

    const playerRanked = await withCache(`brawlhalla-player-ranked-${playerId}`, fetchPlayerRanked, env.CACHE_MAX_AGE_OVERRIDE ?? 15 * 60 * 1000)

    return playerRanked
  },
  getClanById: (clanId: string) => withCache(`brawlhalla-clan-${clanId}`, () => fetchBrawlhallaApi({
    path: `/clan/${clanId}`,
    schema: clanSchema,
    mock: clanMock,
  }), env.CACHE_MAX_AGE_OVERRIDE ?? 15 * 60 * 1000),
  getRankings1v1: (region: string = DEFAULT_RANKINGS_REGION, page: number = DEFAULT_RANKINGS_PAGE, name?: string) => withCache(`brawlhalla-rankings-1v1-${region}-${page}-${name}`, () => fetchBrawlhallaApi({
    path: `/rankings/1v1/${region.toLowerCase()}/${page}${name ? `?name=${name}` : ''}`,
    schema: z.array(ranking1v1Schema),
    mock: rankings1v1Mock,
  }), env.CACHE_MAX_AGE_OVERRIDE ?? 5 * 60 * 1000),
  getRankings2v2: (region: string = DEFAULT_RANKINGS_REGION, page: number = DEFAULT_RANKINGS_PAGE) => withCache(`brawlhalla-rankings-2v2-${region}-${page}`, () => fetchBrawlhallaApi({
    path: `/rankings/2v2/${region.toLowerCase()}/${page}`,
    schema: z.array(ranking2v2Schema),
    mock: rankings2v2Mock,
  }), env.CACHE_MAX_AGE_OVERRIDE ?? 5 * 60 * 1000),
};