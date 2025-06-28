import { Trans } from "@lingui/react/macro"
import { CircleHelp } from "lucide-react"

import { Tooltip } from "@/components/base/Tooltip"
import { LegendIcon } from "@/features/brawlhalla/components/Image"
import type { LegendType } from "@dair/brawlhalla-api/src/constants/legends"

export const WeeklyRotation = ({
	weeklyRotation,
}: { weeklyRotation: LegendType[] }) => {
	return (
		<div className="flex flex-col items-center mt-8">
			<div className="mx-auto grid gap-4 grid-cols-3 md:grid-cols-9 p-4 rounded-2xl bg-secondary border border-border">
				{weeklyRotation.length > 0
					? weeklyRotation.map((legend) => (
							<Tooltip key={legend.legend_id} content={legend.bio_name}>
								<LegendIcon
									legendNameKey={legend.legend_name_key}
									alt={legend.bio_name}
									containerClassName="w-16 h-16 rounded-md"
									className="object-contain object-center border border-border rounded-lg transition-transform scale-100 hover:scale-105"
								/>
							</Tooltip>
						))
					: Array.from({ length: 9 }, (_, i) => (
							<div
								key={i}
								className="relative w-16 h-16 rounded-md bg-border flex justify-center items-center border border-border"
							>
								<CircleHelp className="w-12 h-12 stroke-secondary" />
							</div>
						))}
			</div>
			<span className="text-sm text-muted-foreground mt-2">
				<Trans>Free Legends Rotation</Trans>
			</span>
		</div>
	)
}
