import { Trans } from "@lingui/react/macro"
import type { ReactNode } from "react"

import { Progress } from "@/components/base/Progress"
import {
	FlagIcon,
	RankedTierIcon,
} from "@/features/brawlhalla/components/Image"
import { cn } from "@/ui/lib/utils"

import type { Ranking } from "@dair/brawlhalla-api/src/api/schema/rankings"
import { calculateWinrate } from "@dair/brawlhalla-api/src/helpers/winrate"

type RankingsTableItemProps = Ranking & {
	className?: string
	index?: number
	content: ReactNode
}

export const RankingsTableItem = ({
	className,
	index = 0,
	rank,
	region,
	games,
	wins,
	rating,
	peak_rating,
	content,
	tier,
}: RankingsTableItemProps) => {
	return (
		<>
			<div
				className={cn(
					"block md:hidden",
					"px-4 py-2 w-full h-full items-center gap-4 hover:bg-border",
					{
						"bg-secondary": index % 2 === 0,
						"bg-background": index % 2 === 1,
					},
					className,
				)}
			>
				<div
					className={cn("flex border-b border-muted-foreground py-1", {
						"border-background": index % 2 === 0,
						"border-secondary": index % 2 === 1,
					})}
				>
					<span className="text-lg font-semibold text-muted-foreground mr-2">
						{rank} -
					</span>
					{content}
					<RankedTierIcon
						tier={tier}
						alt={tier}
						containerClassName="w-6 h-6 rounded-md overflow-hidden"
						className="object-contain object-center"
					/>
				</div>
				<div className={cn("mt-2 flex flex-col", className)}>
					<div className="flex gap-2 items-baseline text-2xl font-bold">
						<FlagIcon
							region={region}
							alt={region}
							containerClassName="w-4 h-4 rounded-sm overflow-hidden"
							className="object-contain object-center"
						/>
						{rating}
						<span>/</span>
						<span className="text-muted-foreground text-sm">{peak_rating}</span>
						<span className="ml-2 text-xs font-normal uppercase text-muted-foreground">
							<Trans>peak ({tier})</Trans>
						</span>
					</div>
					<Progress
						value={(wins / games) * 100}
						className="h-1 rounded-full mt-2 overflow-hidden bg-danger"
						indicatorClassName="h-1 bg-success"
					/>
					<div className="flex justify-between font-bold text-sm mt-2">
						<span>
							{wins}W{" "}
							<span className="text-xs text-muted-foreground">
								({calculateWinrate(wins, games).toFixed(2)}
								%)
							</span>
						</span>
						<span>
							{games - wins}L{" "}
							<span className="text-xs text-muted-foreground">
								({calculateWinrate(games - wins, games).toFixed(2)}
								%)
							</span>
						</span>
					</div>
				</div>
			</div>
			<div
				className={cn(
					"hidden md:flex",
					"py-1 w-full h-full items-center gap-4 hover:bg-border",
					{
						"bg-secondary": index % 2 === 0,
						"bg-background": index % 2 === 1,
					},
					className,
				)}
			>
				<p className="w-16 h-full flex items-center justify-center text-xs">
					{rank}
				</p>
				<p className="w-8 h-full flex items-center justify-center text-xs">
					<RankedTierIcon
						tier={tier}
						alt={region}
						containerClassName="w-8 h-8 rounded-md overflow-hidden"
						className="object-contain object-center"
					/>
				</p>
				<p className="w-16 h-full flex items-center justify-center text-xs">
					{region}
				</p>
				{content}
				<p className="w-16 text-center">{games}</p>
				<div className="w-32">
					<Progress
						value={(wins / games) * 100}
						className="h-1 rounded-full mt-2 overflow-hidden bg-danger"
						indicatorClassName="h-2 bg-success"
					/>
					<div className="flex justify-between text-xs mt-2">
						<span>{wins}W</span>
						<span>{games - wins}L</span>
					</div>
				</div>
				<p className="w-20 text-center">
					{calculateWinrate(wins, games).toFixed(2)}%
				</p>
				<div className="w-40 flex items-center justify-start">
					<p>
						<span className="text-xl font-bold">{rating}</span>{" "}
						<span className="text-muted-foreground text-sm">
							/ {peak_rating} peak
						</span>
					</p>
				</div>
			</div>
		</>
	)
}
