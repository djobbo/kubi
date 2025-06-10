import { t } from "@lingui/core/macro"
import { Trans } from "@lingui/react/macro"
import { Link } from "@tanstack/react-router"
import { Shield } from "lucide-react"

import { CollapsibleSection } from "@/features/brawlhalla/components/layout/CollapsibleSection"
import { cn } from "@/ui/lib/utils"
import type { PlayerStats } from "@dair/brawlhalla-api/src/api/schema/player-stats"
import { cleanString } from "@dair/common/src/helpers/clean-string"

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
					<Shield size={20} className="fill-accent-secondary-foreground" />
					<Trans>Clan</Trans>
				</>
			}
		>
			<p>
				<Link
					to={`/stats/clan/$clanId`}
					params={{ clanId: clan.clan_id.toString() }}
					className={cn("inline-block font-bold text-3xl mt-2 hover:underline")}
				>
					{cleanString(clan.clan_name)}
				</Link>
				<span className="inline-block text-xs font-bold ml-2 text-muted-foreground">
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
						value: `${((clan.personal_xp / Number.parseInt(clan.clan_xp)) * 100).toFixed(2)}%`,
						desc: t`Percentage of the clan XP earned by ${playerName}`,
					},
				]}
			/>
		</CollapsibleSection>
	)
}
