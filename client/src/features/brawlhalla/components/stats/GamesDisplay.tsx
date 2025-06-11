import type { ReactNode } from "react"

import { Progress } from "@/components/base/Progress"
import { cn } from "@/ui/lib/utils"

import { calculateWinrate } from "@dair/brawlhalla-api/src/helpers/winrate"

interface GamesCardProps {
	games: number
	wins: number
	description?: ReactNode
	className?: string
	mainContent?: ReactNode
}

export const GamesDisplay = ({
	games,
	wins,
	description,
	className,
	mainContent,
}: GamesCardProps) => {
	return (
		<div className={cn("flex flex-col", className)}>
			<p className="text-5xl font-bold">
				{mainContent ?? games}
				<span className="ml-2 text-xs font-normal uppercase text-muted-foreground">
					{description ?? "games"}
				</span>
			</p>
			<Progress
				value={(wins / games) * 100}
				className="h-2 rounded-full mt-2 overflow-hidden bg-danger"
				indicatorClassName="h-2 bg-success"
			/>
			<div className="flex justify-between font-bold text-md mt-2">
				<span>
					{wins}W{" "}
					<span className="text-xs text-muted-foreground">
						({calculateWinrate(wins, games).toFixed(2)}%)
					</span>
				</span>
				<span>
					{games - wins}L{" "}
					<span className="text-xs text-muted-foreground">
						({calculateWinrate(games - wins, games).toFixed(2)}%)
					</span>
				</span>
			</div>
		</div>
	)
}
