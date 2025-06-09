import {
    powerRankingsMock,
  } from './mocks';
  import { powerRankingsSchema } from '@dair/brawlhalla-api/src/api/schema/power-rankings';
  import { typesafeFetch } from '../../helpers/typesafe-fetch';
  import {
    powerRankedGameModeMap,
    type PowerRankedGameMode,
    PowerRankingsGameMode
  } from '@dair/brawlhalla-api/src/constants/power/game-mode';
  import { PowerRankingsOrderBy, PowerRankingsOrder } from '@dair/brawlhalla-api/src/constants/power/order-by';
  import { PowerRankingsRegion } from '@dair/brawlhalla-api/src/constants/power/regions';

  const BRAWLTOOLS_API_URL = 'https://api.brawltools.com';
  const MAX_RESULTS = 50;
  
  const fetchBrawltoolsApi = typesafeFetch('Brawltools API', BRAWLTOOLS_API_URL);
  
  const DEFAULT_REGION: PowerRankingsRegion = PowerRankingsRegion.NA;
  const DEFAULT_PAGE = 1;
  const DEFAULT_ORDER_BY: PowerRankingsOrderBy = PowerRankingsOrderBy.PowerRank;
  const DEFAULT_ORDER: PowerRankingsOrder = PowerRankingsOrder.Desc;
  const DEFAULT_GAME_MODE: PowerRankedGameMode = PowerRankingsGameMode.Power1v1;

  export const brawltoolsService = {
    getPowerRankings: ({region = DEFAULT_REGION, page = DEFAULT_PAGE, orderBy = DEFAULT_ORDER_BY, order = DEFAULT_ORDER, gameMode = DEFAULT_GAME_MODE}: {region?: string, page?: number, orderBy?: PowerRankingsOrderBy, order?: PowerRankingsOrder, gameMode?: PowerRankedGameMode}) => fetchBrawltoolsApi({
      path: '/pr',
      schema: powerRankingsSchema,
      mock: powerRankingsMock,
    }, {
        body: JSON.stringify({
            gameMode: powerRankedGameModeMap[gameMode],
            orderBy: `${orderBy} ${order}`,
            page,
            region,
            query: null,
            maxResults: MAX_RESULTS,
          }),
          method: 'POST',
    }),
  };