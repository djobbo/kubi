import { RankedTierBanner } from "@/features/brawlhalla/components/Image"
import { Badge } from "@/ui/components/badge"
import type { RankedTier } from "@dair/brawlhalla-api/src/constants/ranked/tiers"
import { WinrateProgress } from "./-winrate-progress"

interface RankedDisplayProps {
	tier: RankedTier | null
	rating: number
	peak_rating: number
	wins: number
	games: number
}

export function RankedDisplay({
	tier,
	rating,
	peak_rating,
	wins,
	games,
}: RankedDisplayProps) {
	return (
		<div className="flex items-center gap-3 sm:gap-4">
			<RankedTierBanner
				tier={tier}
				Container="div"
				containerClassName="w-12 sm:w-16"
				className="object-center object-contain"
			/>
			<div className="flex-1 min-w-0">
				<Badge variant="outline" className="mb-2 text-xs sm:text-sm">
					{tier}
				</Badge>
				<div className="text-2xl font-bold sm:text-3xl">
					{rating}{" "}
					<span className="text-sm text-muted-foreground sm:text-lg">
						/ {peak_rating}{" "}
						<span className="text-xs text-muted-foreground sm:text-sm">
							PEAK
						</span>
					</span>
				</div>
				<WinrateProgress wins={wins} games={games} />
			</div>
		</div>
	)
}
