import { BrawlhallaApi } from "@/services/brawlhalla-api"
import { Archive } from "@/services/archive"
import { shouldUseFetchFirst } from "@/services/fetch-strategy"
import { Effect } from "effect"
import type {
  NewRanked1v1History,
  NewRanked2v2History,
  NewRankedRotatingHistory,
} from "@dair/db"
import { getTeamPlayers } from "@dair/brawlhalla-api/src/helpers/team-players"
import type { AnyRegion } from "@dair/api-contract/src/shared/region"
import type {
  GetRankings1v1Response,
  GetRankings2v2Response,
  Ranking1v1,
  Ranking2v2,
  Rankings1v1,
  Rankings2v2,
  RankingsRotating,
  RankingRotating,
  GetRankingsRotatingResponse,
} from "@dair/api-contract/src/routes/v1/brawlhalla/get-rankings"
import { legendsMap } from "@dair/brawlhalla-api/src/constants/legends"
import {
  InternalServerError,
  TooManyRequests,
} from "@dair/api-contract/src/shared/errors"
import { getEntitySlug } from "@/helpers/entity-slug"

export const getRankings1v1 = (
  region: typeof AnyRegion.Type,
  page: number,
  name?: string,
) =>
  Effect.gen(function* () {
    // TODO: const session = yield* Authorization.getSession();

    const brawlhallaApi = yield* BrawlhallaApi
    const rankings = yield* brawlhallaApi.getRankings1v1(region, page, name)

    const archive = yield* Archive
    const entries: NewRanked1v1History[] = rankings.data.map((r) => ({
      playerId: r.brawlhalla_id,
      name: r.name,
      rank: r.rank,
      rating: r.rating,
      peakRating: r.peak_rating,
      tier: r.tier ?? "Tin 0",
      games: r.games,
      wins: r.wins,
      region: r.region?.toLowerCase() ?? region,
    }))
    yield* archive
      .addRanked1v1History(entries)
      .pipe(
        Effect.catchAll((error) =>
          Effect.logWarning("Failed to archive 1v1 rankings", error),
        ),
      )

    const rankingsData: typeof Rankings1v1.Type = rankings.data.map<
      typeof Ranking1v1.Type
    >((ranking) => {
      const bestLegend =
        legendsMap[ranking.best_legend as keyof typeof legendsMap]

      return {
        rank: ranking.rank,
        rating: ranking.rating,
        tier: ranking.tier,
        games: ranking.games,
        wins: ranking.wins,
        region: ranking.region,
        peak_rating: ranking.peak_rating,
        name: ranking.name,
        id: ranking.brawlhalla_id,
        slug: getEntitySlug(ranking.brawlhalla_id, ranking.name),
        best_legend: bestLegend
          ? {
              id: ranking.best_legend,
              name_key: bestLegend.legend_name_key,
              name: bestLegend.bio_name,
              games: ranking.best_legend_games,
              wins: ranking.best_legend_wins,
            }
          : null,
      }
    })

    const response: typeof GetRankings1v1Response.Type = {
      data: rankingsData,
      meta: {
        updated_at: rankings.updatedAt,
      },
    }

    return response
  }).pipe(
    Effect.tapError(Effect.logError),
    Effect.catchTags({
      BrawlhallaRateLimitError: () => Effect.fail(new TooManyRequests()),
      BrawlhallaApiError: () => Effect.fail(new InternalServerError()),
    }),
    Effect.withSpan("get-rankings-1v1"),
  )

export const getRankings2v2 = (region: typeof AnyRegion.Type, page: number) =>
  Effect.gen(function* () {
    // TODO: const session = yield* Authorization.getSession();

    const brawlhallaApi = yield* BrawlhallaApi
    const rankings = yield* brawlhallaApi.getRankings2v2(region, page)

    const archive = yield* Archive
    const entries: NewRanked2v2History[] = rankings.data.map((r) => {
      return {
        playerIdOne: r.brawlhalla_id_one,
        playerIdTwo: r.brawlhalla_id_two,
        playerNameOne: r.teamname.split("+")[0] ?? r.teamname,
        playerNameTwo: r.teamname.split("+")[1] ?? r.teamname,
        rank: r.rank,
        rating: r.rating,
        peakRating: r.peak_rating,
        tier: r.tier ?? "Tin 0",
        games: r.games,
        wins: r.wins,
        region: r.region?.toLowerCase() ?? region,
      }
    })
    yield* archive
      .addRanked2v2History(entries)
      .pipe(
        Effect.catchAll((error) =>
          Effect.logWarning("Failed to archive 2v2 rankings", error),
        ),
      )

    const rankingsData: typeof Rankings2v2.Type = rankings.data.map<
      typeof Ranking2v2.Type
    >((ranking) => {
      const teamPlayers = getTeamPlayers(ranking)

      return {
        rank: ranking.rank,
        rating: ranking.rating,
        tier: ranking.tier,
        games: ranking.games,
        wins: ranking.wins,
        region: ranking.region,
        peak_rating: ranking.peak_rating,
        team: [
          {
            id: teamPlayers[0].id,
            name: teamPlayers[0].name,
            slug: getEntitySlug(teamPlayers[0].id, teamPlayers[0].name),
          },
          {
            id: teamPlayers[1].id,
            name: teamPlayers[1].name,
            slug: getEntitySlug(teamPlayers[1].id, teamPlayers[1].name),
          },
        ],
      }
    })

    const response: typeof GetRankings2v2Response.Type = {
      data: rankingsData,
      meta: {
        updated_at: rankings.updatedAt,
      },
    }

    return response
  })

export const getRankingsRotating = (
  region: typeof AnyRegion.Type,
  page: number,
) =>
  Effect.gen(function* () {
    // TODO: const session = yield* Authorization.getSession();

    const brawlhallaApi = yield* BrawlhallaApi
    const rankings = yield* brawlhallaApi.getRankingsRotating(region, page)

    const archive = yield* Archive
    const entries: NewRankedRotatingHistory[] = rankings.data.map((r) => ({
      playerId: r.brawlhalla_id,
      name: r.name,
      rank: r.rank,
      rating: r.rating,
      peakRating: r.peak_rating,
      tier: r.tier ?? "Tin 0",
      games: r.games,
      wins: r.wins,
      region: r.region?.toLowerCase() ?? region,
    }))
    yield* archive
      .addRankedRotatingHistory(entries)
      .pipe(
        Effect.catchAll((error) =>
          Effect.logWarning("Failed to archive rotating rankings", error),
        ),
      )

    const rankingsData: typeof RankingsRotating.Type = rankings.data.map<
      typeof RankingRotating.Type
    >((ranking) => {
      return {
        rank: ranking.rank,
        rating: ranking.rating,
        tier: ranking.tier,
        games: ranking.games,
        wins: ranking.wins,
        region: ranking.region,
        peak_rating: ranking.peak_rating,
        name: ranking.name,
        id: ranking.brawlhalla_id,
        slug: getEntitySlug(ranking.brawlhalla_id, ranking.name),
      }
    })

    const response: typeof GetRankingsRotatingResponse.Type = {
      data: rankingsData,
      meta: {
        updated_at: rankings.updatedAt,
      },
    }

    return response
  })
