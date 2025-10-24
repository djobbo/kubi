import { cleanString } from "@dair/common/src/helpers/clean-string"

import type { PlayerRanked } from "../api/schema/player-ranked"
import type { Ranking2v2 } from "../api/schema/rankings"

export const getTeamPlayers = (
	team: PlayerRanked["2v2"][number] | Ranking2v2,
) => {
	const [player1 = team.teamname, player2 = team.teamname] = cleanString(team.teamname).split("+")

	return [
		{
			name: player1,
			id: team.brawlhalla_id_one,
		},
		{
			name: player2,
			id: team.brawlhalla_id_two,
		},
	] as const
}

export const getPlayerTeam = (
	playerId: number,
	team: PlayerRanked["2v2"][number],
) => {
	const teamPlayers = getTeamPlayers(team)

	if (!teamPlayers) return null

	const [player1, player2] = teamPlayers

	if (team.brawlhalla_id_one === playerId) {
		return {
			playerName: player1.name,
			teammate: player2,
		}
	}

	return {
		playerName: player2.name,
		teammate: player1,
	}
}
