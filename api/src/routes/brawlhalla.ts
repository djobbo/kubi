import { Hono } from 'hono';
import { brawlhallaService } from '../services/brawlhalla/brawlhalla-service';
import { brawltoolsService } from '../services/brawltools/brawltools-service';
import { aliasesService } from '../services/aliases';

const brawlhallaRoute = new Hono();

brawlhallaRoute.get('/player/:id', async (c) => {
  const { id } = c.req.param();
  const playerStatsPromise = brawlhallaService.getPlayerStatsById(id);
  const playerRankedPromise = brawlhallaService.getPlayerRankedById(id);
  const [stats, ranked] = await Promise.all([playerStatsPromise, playerRankedPromise]);

  return c.json({
    stats,
    ranked,
  });
});

brawlhallaRoute.get('/clan/:id', async (c) => {
  const { id } = c.req.param();
  const clan = await brawlhallaService.getClanById(id);
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

brawlhallaRoute.get('/search/:name', async (c) => {
  const { name } = c.req.param();
  const aliases = await aliasesService.searchAliases(name);
  return c.json(aliases);
});

brawlhallaRoute.get('/aliases/:playerId/:page?', async (c) => {
  const { playerId, page } = c.req.param();
  const aliases = await aliasesService.getAliases(playerId, page ? parseInt(page) : undefined);
  return c.json(aliases);
});

export default brawlhallaRoute;
