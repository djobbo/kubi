import { t } from "@lingui/core/macro"
import { Trans } from "@lingui/react/macro"
import { Link } from "@tanstack/react-router"
import { Shield } from "lucide-react"

import type { PlayerStats } from "@/features/brawlhalla/api/schema/player-stats"
import { CollapsibleSection } from "@/features/brawlhalla/components/layout/CollapsibleSection"
import { cleanString } from "@/helpers/cleanString"
import { cn } from "@/ui/lib/utils"

import { MiscStatGroup } from "../../MiscStatGroup"

interface PlayerOverviewClanContentProps {
  playerStats: PlayerStats
}

export const PlayerOverviewClanContent = ({
  playerStats,
}: PlayerOverviewClanContentProps) => {
  const { clan } = playerStats

  if (!clan) return null

  const playerName = cleanString(playerStats.name)

  return (
    <CollapsibleSection
      trigger={
        <>
          <Shield size={20} className="fill-accentVar1" />
          <Trans>Clan</Trans>
        </>
      }
    >
      <p>
        <Link
          to={`/stats/clan/${clan.clan_id}`}
          className={cn("inline-block font-bold text-3xl mt-2 hover:underline")}
        >
          {cleanString(clan.clan_name)}
        </Link>
        <span className="inline-block text-xs font-bold ml-2 text-textVar1">
          #{clan.clan_id}
        </span>
      </p>
      <MiscStatGroup
        className="mt-4"
        stats={[
          {
            name: t`Clan XP`,
            value: clan.clan_xp,
            desc: t`XP earned by the clan members since creation`,
          },
          {
            name: t`Contribution`,
            value: `${(
              (clan.personal_xp / parseInt(clan.clan_xp)) *
              100
            ).toFixed(2)}%`,
            desc: t`Percentage of the clan XP earned by ${playerName}`,
          },
        ]}
      />
    </CollapsibleSection>
  )
}
