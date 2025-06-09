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

import { typesafeFetch } from '../../helpers/typesafe-fetch';
import z from 'zod';
import { env } from '../../env';

const BRAWLHALLA_API_URL = 'https://api.brawlhalla.com';

const DEFAULT_RANKINGS_REGION = 'all';
const DEFAULT_RANKINGS_PAGE = 1;

const fetchBrawlhallaApi = typesafeFetch('Brawlhalla API', BRAWLHALLA_API_URL, {
  api_key: env.BRAWLHALLA_API_KEY,
});

export const brawlhallaService = {
  getPlayerStatsById: (playerId: string) => fetchBrawlhallaApi({
    path: `/player/${playerId}/stats`,
    schema: playerStatsSchema,
    mock: playerStatsMock,
  }),
  getPlayerRankedById: (playerId: string) => fetchBrawlhallaApi({
    path: `/player/${playerId}/ranked`,
    schema: playerRankedSchema,
    mock: playerRankedMock,
  }),
  getClanById: (clanId: string) => fetchBrawlhallaApi({
    path: `/clan/${clanId}`,
    schema: clanSchema,
    mock: clanMock,
  }),
  getRankings1v1: (region: string = DEFAULT_RANKINGS_REGION, page: number = DEFAULT_RANKINGS_PAGE, name?: string) => fetchBrawlhallaApi({
    path: `/rankings/1v1/${region.toLowerCase()}/${page}${name ? `?name=${name}` : ''}`,
    schema: z.array(ranking1v1Schema),
    mock: rankings1v1Mock,
  }),
  getRankings2v2: (region: string = DEFAULT_RANKINGS_REGION, page: number = DEFAULT_RANKINGS_PAGE, name?: string) => fetchBrawlhallaApi({
    path: `/rankings/2v2/${region.toLowerCase()}/${page}${name ? `?name=${name}` : ''}`,
    schema: z.array(ranking2v2Schema),
    mock: rankings2v2Mock,
  }),
};