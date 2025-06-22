import type { MiscStat } from "@/features/brawlhalla/components/stats/MiscStatGroup"
import { Card } from "@/ui/components/card"
import { cn } from "@/ui/lib/utils"

type StatsGridProps = {
	stats: MiscStat[]
	cards?: boolean
	gridOverride?: string
}

export function StatsGrid({ stats, cards, gridOverride = "" }: StatsGridProps) {
	return (
		<div className="@container/statsgrid">
			<div
				className={cn("grid grid-cols-1 gap-3", {
					[gridOverride]: gridOverride,
					"grid-cols-1 @sm/statsgrid:grid-cols-2 @sm/statsgrid:gap-4 @xl/statsgrid:grid-cols-4":
						!gridOverride,
				})}
			>
				{cards
					? stats.map((stat) => (
							<Card key={stat.name} className="p-3 @sm/statsgrid:p-4 gap-1">
								<div className="text-xs text-muted-foreground @sm/statsgrid:text-sm">
									{stat.name}
								</div>
								<div className="text-lg font-bold @sm/statsgrid:text-xl">
									{stat.value}
								</div>
							</Card>
						))
					: stats.map((stat) => (
							<div key={stat.name} className="py-1 gap-1">
								<div className="text-xs text-muted-foreground @sm/statsgrid:text-sm">
									{stat.name}
								</div>
								<div className="text-lg font-bold @sm/statsgrid:text-xl">
									{stat.value}
								</div>
							</div>
						))}
			</div>
		</div>
	)
}
