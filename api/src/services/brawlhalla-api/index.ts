import { Config, Effect, type Schema } from "effect";
import { fetchRevalidate } from "@/helpers/fetcher";
import { BrawlhallaApiClan } from "./schema/clan";
import { BrawlhallaApiLegends } from "./schema/legends";
import { BrawlhallaApiPlayerRanked } from "./schema/player-ranked";
import { BrawlhallaApiPlayerStats } from "./schema/player-stats";
import { BrawlhallaApiRankings1v1, BrawlhallaApiRankings2v2 } from './schema/rankings';

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

export const BrawlhallaApi = {
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
  getRankings1v1: (region: string, page: number, name?: string) =>
    fetchBrawlhallaApi({
      name: "getRankings1v1",
      schema: BrawlhallaApiRankings1v1,
      path: `/rankings/1v1/${region.toLowerCase()}/${page}${name ? `?name=${name}` : ""}`,
      cacheName: `brawlhalla-rankings-1v1-${region}-${page}-${name}`,
    }),
  getRankings2v2: (region: string, page: number) =>
    fetchBrawlhallaApi({
      name: "getRankings2v2",
      schema: BrawlhallaApiRankings2v2,
      path: `/rankings/2v2/${region.toLowerCase()}/${page}`,
      cacheName: `brawlhalla-rankings-2v2-${region}-${page}`,
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
