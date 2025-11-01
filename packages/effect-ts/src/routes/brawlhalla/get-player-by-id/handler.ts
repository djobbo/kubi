import { rankedRegions } from "@dair/brawlhalla-api/src/constants/ranked/regions";
import {
  getLegendsAccumulativeData,
  getWeaponlessData,
  getWeaponsData,
  parsePlayerLegends,
} from "@dair/brawlhalla-api/src/helpers/parser";
import {
  getPersonalRatingReset,
  getSeasonStats,
} from "@dair/brawlhalla-api/src/helpers/season-reset";
import { getLegendOrTeamRatingReset } from "@dair/brawlhalla-api/src/helpers/season-reset";
import { getTeamPlayers } from "@dair/brawlhalla-api/src/helpers/team-players";
import { calculateWinrate } from "@dair/brawlhalla-api/src/helpers/winrate";
import { Effect } from "effect";
import * as Archive from "../../../services/archive";
import { BrawlhallaApi } from "../../../services/brawlhalla-api";

import { cleanString } from "@dair/common/src/helpers/clean-string";
import { Authorization } from "../../../services/authorization";
import type {
  GetPlayerByIdResponse,
  Player,
  PlayerAliases,
  PlayerClan,
  PlayerGadgets,
  PlayerRanked,
  PlayerRanked1v1,
  PlayerRanked2v2,
  PlayerRankedRotating,
} from "./schema";
import {
  InternalServerError,
  NotFound,
  ServiceUnavailable,
} from "@effect/platform/HttpApiError";

export const getPlayerById = (playerId: number) =>
  Effect.gen(function* () {
    // TODO: const session = yield* Authorization.getSession();

    const [playerStats, playerRanked, allLegends] = yield* Effect.all(
      [
        BrawlhallaApi.getPlayerStatsById(playerId),
        BrawlhallaApi.getPlayerRankedById(playerId),
        BrawlhallaApi.getAllLegendsData(),
      ],
      { concurrency: 3 }
    );
    const clanId = playerStats.data.clan?.clan_id;
    const archiveService = yield* Archive.Archive;
    const [aliases, clan, [bookmark], [clanBookmark]] = yield* Effect.all([
      archiveService.getAliases(playerId),
      clanId ? BrawlhallaApi.getClanById(clanId) : Effect.succeed(null),
      Effect.succeed([null]), // TODO: bookmark service,
      Effect.succeed([null]), // TODO: bookmark service,
    ]);

    const aliasesData: typeof PlayerAliases.Type = [
      ...new Set(
        aliases
          .toSorted((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
          .map((alias) => cleanString(alias.alias))
          .filter((alias) => alias !== name)
      ),
    ];

    // const bookmarksService = yield* BookmarksService.BookmarksService
    // const [
    //   aliases,
    //   clan,
    //   // [bookmark],
    //   // maybeClanBookmark
    // ] =
    // yield* Effect.all([
    // 		archiveService.getAliases(playerId),
    //     clanId ? brawlhallaApi.clanById(clanId).fetch() : null,
    // 		// bookmarksService.getBookmarksByPageIds(session?.user.id, [
    // 		// 	{ pageId: playerId, pageType: "player_stats" },
    // 		// ]),
    // 		// clanId
    // 		// 	? bookmarksService.getBookmarksByPageIds(session?.user.id, [
    // 		// 			{ pageId: clanId, pageType: "clan_stats" },
    // 		// 		])
    // 		// 	: null,
    // 	])

    const updated_at =
      playerStats.updatedAt.getTime() > playerRanked.updatedAt.getTime()
        ? playerStats.updatedAt
        : playerRanked.updatedAt;

    const legends = parsePlayerLegends(
      playerStats.data.legends,
      playerRanked.data.legends,
      allLegends.data
    );
    const accumulativeData = getLegendsAccumulativeData(legends);
    const weapons = getWeaponsData(legends);
    const { unarmed, gadgets, weapon_throws } = getWeaponlessData(legends);

    const name = playerStats.data.name;
    const brawlhallaId = playerStats.data.brawlhalla_id;

    const clanMember = clan?.data.clan.find(
      (member) => member.brawlhalla_id === brawlhallaId
    );

    const seasonStats = getSeasonStats(playerRanked.data);
    const ranked2v2AccumulativeData = playerRanked.data["2v2"]?.reduce(
      ({ totalWins, totalGames, totalRating, totalPeakRating }, team) => ({
        totalWins: totalWins + team.wins,
        totalGames: totalGames + team.games,
        totalRating: totalRating + team.rating,
        totalPeakRating: totalPeakRating + team.peak_rating,
      }),
      {
        totalWins: 0,
        totalGames: 0,
        totalRating: 0,
        totalPeakRating: 0,
      }
    );

    const ranked1v1: typeof PlayerRanked1v1.Type | null =
      playerRanked.data.games > 0
        ? {
            rating: playerRanked.data.rating,
            peak_rating:
              playerRanked.data.peak_rating || playerRanked.data.rating,
            is_placement_matches: !playerRanked.data.peak_rating,
            tier: playerRanked.data.tier ?? "Valhallan",
            wins: playerRanked.data.wins,
            games: playerRanked.data.games,
            region: playerRanked.data.region?.toLowerCase() ?? null,
            rating_reset: getPersonalRatingReset(playerRanked.data.rating),
          }
        : null;

    const ranked2v2: typeof PlayerRanked2v2.Type | null =
      playerRanked.data["2v2"] && playerRanked.data["2v2"].length > 0
        ? {
            games: ranked2v2AccumulativeData.totalGames,
            wins: ranked2v2AccumulativeData.totalWins,
            average_peak_rating: calculateWinrate(
              ranked2v2AccumulativeData.totalPeakRating,
              ranked2v2AccumulativeData.totalGames
            ),
            average_rating: calculateWinrate(
              ranked2v2AccumulativeData.totalRating,
              ranked2v2AccumulativeData.totalGames
            ),
            teams: playerRanked.data["2v2"]
              .map((team) => {
                const players = getTeamPlayers(team);
                if (!players) return null;
                const [player1, player2] = players;

                const teammate =
                  player1.id === brawlhallaId ? player2 : player1;

                return {
                  teammate,
                  rating: team.rating,
                  peak_rating: team.peak_rating,
                  tier: team.tier ?? "Valhallan",
                  wins: team.wins,
                  games: team.games,
                  region: team.region
                    ? rankedRegions[team.region - 1] ?? null
                    : null,
                  rating_reset: getLegendOrTeamRatingReset(team.rating),
                };
              })
              .filter((team) => !!team)
              .toSorted((teamA, teamB) => teamB.rating - teamA.rating),
          }
        : null;

    const rotatingRanked: typeof PlayerRankedRotating.Type | null =
      playerRanked.data.rotating_ranked &&
      !Array.isArray(playerRanked.data.rotating_ranked) &&
      playerRanked.data.rotating_ranked.games > 0
        ? {
            rating: playerRanked.data.rotating_ranked.rating,
            peak_rating: playerRanked.data.rotating_ranked.peak_rating,
            tier: playerRanked.data.rotating_ranked.tier,
            wins: playerRanked.data.rotating_ranked.wins,
            games: playerRanked.data.rotating_ranked.games,
            region:
              playerRanked.data.rotating_ranked.region?.toLowerCase() ?? null,
          }
        : null;

    const ranked: typeof PlayerRanked.Type | null = playerRanked.data
      ? {
          stats: {
            games: seasonStats.totalGames,
            wins: seasonStats.totalWins,
            peak_rating: seasonStats.bestRating,
            glory: {
              from_wins: seasonStats.gloryFromWins,
              from_peak_rating: seasonStats.gloryFromPeakRating,
              total: seasonStats.totalGlory,
            },
          },
          "1v1": ranked1v1,
          "2v2": ranked2v2,
          rotating: rotatingRanked,
        }
      : null;

    const clanData: typeof PlayerClan.Type | null = playerStats.data.clan
      ? {
          id: playerStats.data.clan.clan_id,
          name: playerStats.data.clan.clan_name,
          xp: Number.parseInt(playerStats.data.clan.clan_xp),
          personal_xp: playerStats.data.clan.personal_xp,
          joined_at: clanMember?.join_date ?? null,
          rank: clanMember?.rank ?? null,
          created_at: clan?.data.clan_create_date ?? null,
          members_count: clan?.data.clan.length ?? null,
          bookmark: clanBookmark ?? null,
        }
      : null;

    const gadgetsData: typeof PlayerGadgets.Type = {
      ...gadgets,
      bomb: {
        damage_dealt: playerStats.data.damagebomb,
        kos: playerStats.data.kobomb,
      },
      mine: {
        damage_dealt: playerStats.data.damagemine,
        kos: playerStats.data.komine,
      },
      spikeball: {
        damage_dealt: playerStats.data.damagespikeball,
        kos: playerStats.data.kospikeball,
      },
      sidekick: {
        damage_dealt: playerStats.data.damagesidekick,
        kos: playerStats.data.kosidekick,
      },
      snowball: {
        hits: playerStats.data.hitsnowball,
        kos: playerStats.data.kosnowball,
      },
    };

    const playerData: typeof Player.Type = {
      id: brawlhallaId,
      name,
      aliases: aliasesData,
      stats: {
        xp: playerStats.data.xp,
        level: playerStats.data.level,
        xp_percentage:
          playerStats.data.level === 100 ? 100 : playerStats.data.xp_percentage,
        games: playerStats.data.games,
        wins: playerStats.data.wins,
        ...accumulativeData,
      },
      ranked,
      clan: clanData,
      unarmed,
      weapon_throws,
      gadgets: gadgetsData,
      weapons: weapons.toSorted(
        (weaponA, weaponB) => weaponB.stats.xp - weaponA.stats.xp
      ),
      legends: legends.toSorted(
        (legendA, legendB) => legendB.stats.xp - legendA.stats.xp
      ),
      bookmark: bookmark ?? null,
    };

    const response: typeof GetPlayerByIdResponse.Type = {
      data: playerData,
      meta: {
        updated_at,
      },
    };

    return response;
  }).pipe(
    Effect.tapError(Effect.logError),
    Effect.catchTags({
      ResponseError: Effect.fn(function* (error) {
        switch (error.response.status) {
          case 404:
            return yield* Effect.fail(new NotFound());
          case 429:
            return yield* Effect.fail(new ServiceUnavailable());
          default:
            return yield* Effect.fail(new InternalServerError());
        }
      }),
      ArchiveError: () => Effect.fail(new InternalServerError()),
      DBError: () => Effect.fail(new InternalServerError()),
      ParseError: () => Effect.fail(new InternalServerError()),
      RequestError: () => Effect.fail(new InternalServerError()),
      TimeoutException: () => Effect.fail(new InternalServerError()),
      HttpBodyError: () => Effect.fail(new InternalServerError()),
      ConfigError: Effect.die,
    }),
    Effect.withSpan("get-player-by-id")
  );
