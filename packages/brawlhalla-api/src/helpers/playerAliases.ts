import { cleanString } from "@/helpers/cleanString"

import type { PlayerRanked } from "../api/schema/player-ranked"
import type { PlayerStats } from "../api/schema/player-stats"
import { getPlayerTeam } from "./teamPlayers"

export const getPlayerAliases = (
  playerStats: PlayerStats,
  playerRanked?: PlayerRanked,
) =>
  [
    ...new Set([
      cleanString(playerStats.name),
      ...(playerRanked?.["2v2"].map((team) => {
        const player = getPlayerTeam(playerRanked.brawlhalla_id, team)

        if (!player) return null

        return cleanString(player.playerName)
      }) ?? []),
    ]),
  ].filter((alias): alias is string => !!alias)
