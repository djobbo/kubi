import { Hono } from 'hono';
import { brawlhallaService } from '../../services/brawlhalla/brawlhalla-service';
import { brawltoolsService } from '../../services/brawltools/brawltools-service';
import { archiveService } from '../../services/archive';
import { getRegion } from '../../services/locate';
import { getIp } from '../../helpers/get-ip';
import { brawlhallaGqlService } from '../../services/brawlhalla-gql/brawlhalla-gql-service';

export const brawlhallaRoute = new Hono();

brawlhallaRoute.get('/players/search', async (c) => {
  const { name } = c.req.query();
  const aliases = await archiveService.searchAliases(name);
  return c.json(aliases);
});

brawlhallaRoute.get('/players/:playerId', async (c) => {
  const { playerId } = c.req.param();
  const playerStatsPromise = brawlhallaService.getPlayerStatsById(playerId);
  const playerRankedPromise = brawlhallaService.getPlayerRankedById(playerId);
  const [stats, ranked] = await Promise.all([playerStatsPromise, playerRankedPromise]);

  return c.json({
    stats,
    ranked,
  });
});

brawlhallaRoute.get('/players/:playerId/aliases/:page?', async (c) => {
  const { playerId, page } = c.req.param();
  const aliases = await archiveService.getAliases(playerId, page ? parseInt(page) : undefined);
  return c.json(aliases);
});

brawlhallaRoute.get('/clans/search/:page?', async (c) => {
  const { page } = c.req.param();
  const { name } = c.req.query();
  const clans = await archiveService.getClans({
    page: page ? parseInt(page) : undefined,
    name,
  });
  return c.json(clans);
});

brawlhallaRoute.get('/clans/:clanId', async (c) => {
  const { clanId } = c.req.param();
  const clan = await brawlhallaService.getClanById(clanId);
  return c.json(clan);
});

brawlhallaRoute.get('/rankings/1v1/:region?/:page?', async (c) => {
  const { region, page } = c.req.param();
  const { name } = c.req.query();
  const rankings = await brawlhallaService.getRankings1v1(region, page ? parseInt(page) : undefined, name);
  return c.json(rankings);
});

brawlhallaRoute.get('/rankings/2v2/:region?/:page?', async (c) => {
  const { region, page } = c.req.param();
  const rankings = await brawlhallaService.getRankings2v2(region, page ? parseInt(page) : undefined);
  return c.json(rankings);
});

brawlhallaRoute.get('/rankings/power/:region?/:page?', async (c) => {
  const { region, page } = c.req.param();
  const { orderBy, order, gameMode } = c.req.query();

  const rankings = await brawltoolsService.getPowerRankings({
    region,
    page,
    orderBy,
    order,
    gameMode,
  });
  return c.json(rankings);
});

brawlhallaRoute.get('/locate', async (c) => {
  const ip = getIp(c)

  if (!ip) {
    return c.json({ error: 'Could not determine region' }, 400)
  }

  const region = await getRegion(ip);
  return c.json({ region });
});

brawlhallaRoute.get('/weekly-rotation', async (c) => {
  const weeklyRotation = await brawlhallaGqlService.getWeeklyRotation();
  return c.json(weeklyRotation);
});

brawlhallaRoute.get('/articles/:category?', async (c) => {
  const { category } = c.req.param();
  const articles = await brawlhallaGqlService.getArticles({
    category,
  });
  return c.json(articles);
});
