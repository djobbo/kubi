import { t } from "@lingui/core/macro"
import { Link } from "@tanstack/react-router"

import { Card } from "@/components/base/Card"
import {
  FlagIcon,
  RankedTierImage,
} from "@/features/brawlhalla/components/Image"
import { cleanString } from "@/helpers/cleanString"
import { css } from "@/panda/css"
import { cn } from "@/ui/lib/utils"

import type { PlayerRanked } from "../../api/schema/player-ranked"
import { rankedRegions } from "../../constants/ranked/regions"
import { getTierFromRating } from "../../constants/ranked/tiers"
import { getLegendEloReset } from "../../helpers/season-reset"
import { getPlayerTeam } from "../../helpers/teamPlayers"
import { calculateWinrate } from "../../helpers/winrate"
import { MiscStatGroup } from "./MiscStatGroup"
import { RatingDisplay } from "./RatingDisplay"

interface TeamCardProps {
  playerId: number
  team: PlayerRanked["2v2"][number]
}

const rankedBannerClassName = css({
  top: 0,
  right: "-1rem",
  bottom: "-2rem",
  opacity: 0.08,
  transform: "translateX(25%) rotate(15deg)",
  zIndex: -1,
})

export const TeamCard = ({ playerId, team }: TeamCardProps) => {
  const teamData = getPlayerTeam(playerId, team)
  if (!teamData) return null

  const { playerName, teammate } = teamData
  const regionTxt = rankedRegions[team.region - 1] ?? "all"
  const eloReset = getLegendEloReset(team.rating)
  const eloResetTier = getTierFromRating(eloReset)

  return (
    <Link
      to={`/stats/player/$playerId`}
      params={{ playerId: teammate.id.toString() }}
    >
      <Card
        className="relative overflow-hidden z-0 hover:bg-bgVar2 border border-bg"
        title={
          <span className="flex items-center">
            <FlagIcon
              region={regionTxt}
              alt={regionTxt}
              Container="span"
              containerClassName="block w-4 h-4 rounded overflow-hidden mr-2"
              className="object-contain object-center"
            />
            {cleanString(playerName)} {"&"} {cleanString(teammate.name)}
          </span>
        }
      >
        <RankedTierImage
          type="banner"
          tier={team.tier ?? "Valhallan"}
          alt={team.tier ?? t`Valhallan`}
          containerClassName={cn(" w-full", rankedBannerClassName)}
          position="absolute"
          className="object-contain object-center"
        />
        <RatingDisplay
          games={team.games}
          wins={team.wins}
          peak_rating={team.peak_rating}
          rating={team.rating}
        />
        <MiscStatGroup
          className="mt-4 text-center"
          minItemWidth="4rem"
          stats={[
            {
              name: t`Games`,
              value: team.games,
              desc: t`Games played this season`,
            },
            {
              name: t`Winrate`,
              value: `${calculateWinrate(team.wins, team.games).toFixed(2)}%`,
              desc: t`Winrate this season (wins / games)`,
            },
            {
              name: t`Elo reset`,
              value: eloReset,
              desc: t`Elo reset for next season (${eloResetTier})`,
            },
          ]}
        />
      </Card>
    </Link>
  )
}
