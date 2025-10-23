import { Config, Effect, Schema } from "effect";
import { fetchRevalidate } from "../../helpers/fetcher";
import { BrawlhallaApiClan } from "./schema/clan";
import { BrawlhallaApiLegends } from "./schema/legends";
import { BrawlhallaApiPlayerRanked } from "./schema/player-ranked";
import { BrawlhallaApiPlayerStats } from "./schema/player-stats";

const BASE_URL = "https://api.brawlhalla.com";

type FetchBrawlhallaApiOptions<T, U> = {
  name: string;
  schema: Schema.Schema<T, U>;
  path: string;
  searchParams?: Record<string, string>;
  cacheName: string;
};

const fetchBrawlhallaApi = <T, U>({
  name,
  schema,
  path,
  searchParams = {},
  cacheName,
}: FetchBrawlhallaApiOptions<T, U>) =>
  Effect.gen(function* () {
    // TODO: use env.BRAWLHALLA_API_KEY
    const apiKey = yield* Config.nonEmptyString("BRAWLHALLA_API_KEY");

    const url = new URL(path, BASE_URL);
    for (const [key, value] of Object.entries(searchParams)) {
      url.searchParams.set(key, value);
    }
    url.searchParams.set("api_key", apiKey);

    return yield* fetchRevalidate(schema, {
      method: "GET",
      url: url.toString(),
      cacheName,
    });
  }).pipe(Effect.withSpan(`BrawlhallaApi.${name}`));

export const brawlhallaApi = {
  getPlayerStatsById: (playerId: number) =>
    fetchBrawlhallaApi({
      name: "getPlayerStatsById",
      schema: BrawlhallaApiPlayerStats,
      path: `/player/${playerId}/stats`,
      cacheName: `brawlhalla-player-stats-${playerId}`,
    }),
  getPlayerRankedById: (playerId: number) =>
    fetchBrawlhallaApi({
      name: "getPlayerRankedById",
      schema: BrawlhallaApiPlayerRanked,
      path: `/player/${playerId}/ranked`,
      cacheName: `brawlhalla-player-ranked-${playerId}`,
    }),
  getClanById: (clanId: number) =>
    fetchBrawlhallaApi({
      name: "getClanById",
      schema: BrawlhallaApiClan,
      path: `/clan/${clanId}`,
      cacheName: `brawlhalla-clan-${clanId}`,
    }),
  getAllLegendsData: () =>
    fetchBrawlhallaApi({
      name: "getAllLegendsData",
      schema: BrawlhallaApiLegends,
      path: "/legend/all",
      cacheName: "brawlhalla-legend-all",
    }),
}
