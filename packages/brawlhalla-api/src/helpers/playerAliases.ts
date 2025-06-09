import { fixEncoding } from "@dair/common/src/helpers/fix-encoding"

import type { PlayerRanked } from "../api/schema/player-ranked"
import type { PlayerStats } from "../api/schema/player-stats"
import { getPlayerTeam } from "./team-players"

export const getPlayerAliases = (
  playerStats: PlayerStats,
  playerRanked?: PlayerRanked,
) =>
  [
    ...new Set([
      fixEncoding(playerStats.name),
      ...(playerRanked?.["2v2"].map((team) => {
        const player = getPlayerTeam(playerRanked.brawlhalla_id, team)

        if (!player) return null

        return fixEncoding(player.playerName)
      }) ?? []),
    ]),
  ].filter((alias): alias is string => !!alias)
