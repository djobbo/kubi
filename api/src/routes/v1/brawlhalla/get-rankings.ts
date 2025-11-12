import { BrawlhallaApi } from "@/services/brawlhalla-api"
import { Effect } from "effect"

import type { AnyRegion } from "@dair/api-contract/src/common/region"
import type {
	GetRankings1v1Response,
	GetRankings2v2Response,
	Ranking1v1,
	Ranking2v2,
	Rankings1v1,
	Rankings2v2,
} from "@dair/api-contract/src/routes/v1/brawlhalla/get-rankings"
import { legendsMap } from "@dair/brawlhalla-api/src/constants/legends"
import { getTeamPlayers } from "@dair/brawlhalla-api/src/helpers/team-players"
import {
	InternalServerError,
	NotFound,
	ServiceUnavailable,
} from "@effect/platform/HttpApiError"

export const getRankings1v1 = (
	region: typeof AnyRegion.Type,
	page: number,
	name?: string,
) =>
	Effect.gen(function* () {
		// TODO: const session = yield* Authorization.getSession();

		const [rankings] = yield* Effect.all(
			[BrawlhallaApi.getRankings1v1(region, page, name)],
			{
				concurrency: 1,
			},
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
			ResponseError: Effect.fn(function* (error) {
				switch (error.response.status) {
					case 404:
						return yield* Effect.fail(new NotFound())
					case 429:
						return yield* Effect.fail(new ServiceUnavailable())
					default:
						return yield* Effect.fail(new InternalServerError())
				}
			}),
			DBError: () => Effect.fail(new InternalServerError()),
			ParseError: () => Effect.fail(new InternalServerError()),
			RequestError: () => Effect.fail(new InternalServerError()),
			TimeoutException: () => Effect.fail(new InternalServerError()),
			HttpBodyError: () => Effect.fail(new InternalServerError()),
			ConfigError: Effect.die,
		}),
	)

export const getRankings2v2 = (region: typeof AnyRegion.Type, page: number) =>
	Effect.gen(function* () {
		// TODO: const session = yield* Authorization.getSession();

		const [rankings] = yield* Effect.all(
			[BrawlhallaApi.getRankings2v2(region, page)],
			{
				concurrency: 1,
			},
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
				team: teamPlayers,
			}
		})

		const response: typeof GetRankings2v2Response.Type = {
			data: rankingsData,
			meta: {
				updated_at: rankings.updatedAt,
			},
		}

		return response
	}).pipe(
		Effect.tapError(Effect.logError),
		Effect.catchTags({
			ResponseError: Effect.fn(function* (error) {
				switch (error.response.status) {
					case 404:
						return yield* Effect.fail(new NotFound())
					case 429:
						return yield* Effect.fail(new ServiceUnavailable())
					default:
						return yield* Effect.fail(new InternalServerError())
				}
			}),
			DBError: () => Effect.fail(new InternalServerError()),
			ParseError: () => Effect.fail(new InternalServerError()),
			RequestError: () => Effect.fail(new InternalServerError()),
			TimeoutException: () => Effect.fail(new InternalServerError()),
			HttpBodyError: () => Effect.fail(new InternalServerError()),
			ConfigError: Effect.die,
		}),
		Effect.withSpan("get-rankings-2v2"),
	)
