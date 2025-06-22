import { Progress } from "@/ui/components/progress"
import { calculateWinrate } from "@dair/brawlhalla-api/src/helpers/winrate"

export function WinrateProgress({
	wins,
	games,
}: { wins: number; games: number }) {
	const winrate = calculateWinrate(wins, games)
	const losses = games - wins

	return (
		<div className="space-y-2">
			<Progress value={winrate} className="h-2 mt-2" />
			<div className="flex justify-between text-xs sm:text-sm">
				<span>
					{wins.toLocaleString()}W ({winrate.toFixed(1)}%)
				</span>
				<span>
					{losses.toLocaleString()}L ({(100 - winrate).toFixed(1)}%)
				</span>
			</div>
		</div>
	)
}
