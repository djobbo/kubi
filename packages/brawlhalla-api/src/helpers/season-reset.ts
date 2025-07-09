import type { PlayerRanked } from "../api/schema/player-ranked"

export const getGloryFromWins = (wins: number): number =>
	wins <= 150
		? 20 * wins
		: Math.floor(10 * (45 * Math.log10(wins * 2) ** 2) + 245)

export const getGloryFromPeakRating = (bestRating: number): number =>
	Math.floor(
		(() => {
			if (bestRating < 1200) return 250
			if (bestRating < 1286)
				return 10 * (25 + 0.872093023 * (86 - (1286 - bestRating)))
			if (bestRating < 1390)
				return 10 * (100 + 0.721153846 * (104 - (1390 - bestRating)))
			if (bestRating < 1680)
				return 10 * (187 + 0.389655172 * (290 - (1680 - bestRating)))
			if (bestRating < 2000)
				return 10 * (300 + 0.428125 * (320 - (2000 - bestRating)))
			if (bestRating < 2300)
				return 10 * (437 + 0.143333333 * (300 - (2300 - bestRating)))
			return 10 * (480 + 0.05 * (400 - (2700 - bestRating)))
		})(),
	)

export const getSeasonStats = (playerRanked: PlayerRanked) => {
	const rotatingRanked =
		!playerRanked.rotating_ranked || Array.isArray(playerRanked.rotating_ranked)
			? {
					games: 0,
					wins: 0,
					peak_rating: 0,
				}
			: {
					games: playerRanked.rotating_ranked.games,
					wins: playerRanked.rotating_ranked.wins,
					peak_rating: playerRanked.rotating_ranked.peak_rating,
				}

	const games = [
		playerRanked.games,
		rotatingRanked.games,
		...playerRanked["2v2"].map((team) => team.games),
	]
	const wins = [
		playerRanked.wins,
		rotatingRanked.wins,
		...playerRanked["2v2"].map((team) => team.wins),
	]
	const ratings = [
		playerRanked.peak_rating,
		rotatingRanked.peak_rating,
		...playerRanked["2v2"].map((team) => team.peak_rating),
		...playerRanked.legends.map((legend) => legend.peak_rating),
	]

	const totalWins = wins.reduce((a, b) => a + b, 0)
	const totalGames = games.reduce((a, b) => a + b, 0)
	const bestRating = Math.max(...ratings)

	const hasPlayedEnoughGames = totalGames >= 10
	const gloryFromWins = hasPlayedEnoughGames ? getGloryFromWins(totalWins) : 0
	const gloryFromPeakRating = hasPlayedEnoughGames
		? getGloryFromPeakRating(bestRating)
		: 0
	const totalGlory = gloryFromWins + gloryFromPeakRating

	return {
		totalWins,
		totalGames,
		gloryFromWins,
		gloryFromPeakRating,
		bestRating,
		totalGlory,
	}
}

/**
 * Get Legend or Team elo after season reset
 * @param rating Rating
 * @returns Elo Reset
 */
export const getLegendOrTeamRatingReset = (rating: number): number =>
	rating < 2000
		? Math.floor((rating + 375) / 1.5)
		: Math.floor(1583 + (rating - 2000) / 10)

export const getPersonalRatingReset = (rating: number): number =>
	rating >= 1400
		? Math.floor(1400 + (rating - 1400.0) / (3.0 - (3000 - rating) / 800.0))
		: rating
