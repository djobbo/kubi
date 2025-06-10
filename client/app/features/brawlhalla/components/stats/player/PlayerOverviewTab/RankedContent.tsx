import { t } from "@lingui/core/macro"
import { Trans } from "@lingui/react/macro"
import { ChevronsUp } from "lucide-react"

import type { PlayerRanked } from "@dair/brawlhalla-api/src/api/schema/player-ranked"
import { getTierFromRating } from "@dair/brawlhalla-api/src/constants/ranked/tiers"
import {
	getGlory,
	getPersonalEloReset,
} from "@dair/brawlhalla-api/src/helpers/season-reset"
import { calculateWinrate } from "@dair/brawlhalla-api/src/helpers/winrate"

import { RankedTierBanner } from "../../../Image"
import { CollapsibleSection } from "../../../layout/CollapsibleSection"
import type { MiscStat } from "../../MiscStatGroup"
import { MiscStatGroup } from "../../MiscStatGroup"
import { RatingDisplay } from "../../RatingDisplay"

interface PlayerOverviewRankedContentProps {
	ranked: PlayerRanked
}

export const PlayerOverviewRankedContent = ({
	ranked,
}: PlayerOverviewRankedContentProps) => {
	const glory = getGlory(ranked)

	const eloReset = getPersonalEloReset(ranked.rating)

	const rankedStats: MiscStat[] = [
		{
			name: t`1v1 Games`,
			value: ranked.games,
			desc: t`1v1 Ranked games played this season`,
		},
		// {
		//     name: "Total Games",
		//     value: totalGames,
		//     desc: "Total ranked games played this season (all gamemodes)",
		// },
		{
			name: t`Winrate`,
			value: `${calculateWinrate(ranked.wins, ranked.games).toFixed(2)}%`,
			desc: t`Ranked winrate (ranked wins / ranked games)`,
		},
		...(glory.hasPlayedEnoughGames
			? [
					{
						name: t`Total Glory`,
						value: glory.totalGlory,
						desc: t`Total glory earned this season (wins + best rating)`,
					},
					{
						name: t`Glory from rating`,
						value: glory.gloryFromBestRating,
						desc: t`Glory earned from best rating (${glory.bestRating} Elo)`,
					},
					{
						name: t`Glory from wins`,
						value: glory.gloryFromWins,
						desc: t`Glory earned from wins (${glory.totalWins} Wins)`,
					},
				]
			: [
					{
						name: t`Total Glory`,
						value: t`N/A (not enough games)`,
						desc: t`Total glory earned this season (wins + best rating)`,
					},
				]),
		{
			name: t`Elo reset`,
			value: <>{eloReset}</>,
			desc: t`Elo reset for next season (${getTierFromRating(eloReset)})`,
		},
	]

	return (
		<CollapsibleSection
			trigger={
				<>
					<ChevronsUp size={20} className="fill-accent-secondary-foreground" />
					<Trans>Ranked Season</Trans>
				</>
			}
		>
			<div className="flex items-center gap-4">
				<RankedTierBanner
					tier={ranked.tier ?? "Valhallan"}
					alt={ranked.tier ?? t`Valhallan`}
					containerClassName="h-24 w-16"
					className="object-contain object-center"
				/>
				<div>
					<span className="text-sm font-light">{ranked.tier}</span>
					<RatingDisplay
						className="w-80"
						games={ranked.games}
						wins={ranked.wins}
						rating={ranked.rating}
						peak_rating={ranked.peak_rating}
					/>
				</div>
			</div>
			<MiscStatGroup className="mt-4" stats={rankedStats} />
		</CollapsibleSection>
	)
}
