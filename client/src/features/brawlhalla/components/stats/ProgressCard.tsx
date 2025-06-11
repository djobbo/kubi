import { Card } from "@/components/base/Card"
import { Progress } from "@/components/base/Progress"

interface ProgressCardProps {
	title?: string
	bars: { title: string; value: number; progress: number }[]
}

export const ProgressCard = ({ title, bars }: ProgressCardProps) => {
	return (
		<Card title={title} contentClassName="flex flex-col">
			{bars.map(({ title, value, progress }) => (
				<div className="mt-3" key={title}>
					<p className="font-bold">
						{value}{" "}
						<span className="text-sm text-muted-foreground">{title}</span>
					</p>
					<Progress
						value={progress}
						className="h-1 rounded-full mt-2 overflow-hidden bg-background"
						indicatorClassName="h-2 bg-gradient-to-r from-accent-foreground to-accent-secondary-foreground"
					/>
				</div>
			))}
		</Card>
	)
}
