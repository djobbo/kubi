import { t } from "@lingui/core/macro"
import {
	Shield,
	UserRound,
	UsersRound,
	Zap,
} from "lucide-react"

import { cn } from "@/ui/lib/utils"

const getSubHeaderNavigation = () =>
	[
		{
			title: t`1v1 Rankings`,
			href: "/rankings",
			icon: <UserRound className="w-6 h-6" strokeWidth={1} />,
		},
		{
			title: t`2v2 Rankings`,
			href: "/rankings/2v2",
			icon: <UsersRound className="w-6 h-6" strokeWidth={1} />,
		},
		{
			title: t`Power Rankings`,
			href: "/rankings/power",
			icon: <Zap className="w-6 h-6" strokeWidth={1} />,
		},
		{
			title: t`Clans`,
			href: "/clans",
			icon: <Shield className="w-6 h-6" strokeWidth={1} />,
		},
	] as const

interface SubHeaderProps {
	className?: string
}

export const AppNav = ({ className }: SubHeaderProps) => {
	return (
		<div className="w-full gap-8 bg-gradient-to-l from-accent-foreground to-ring shadow-md">
			<div
				className={cn(
					className,
					"mx-auto px-4 py-1 flex items-center justify-around max-w-screen-lg gap-8",
				)}
			>
				{getSubHeaderNavigation().map(({ title, href, icon }) => (
					<a
						key={title}
						className="flex flex-col items-center justify-center w-32"
						href={href}
					>
						{icon}
						<span className="text-xs text-foreground mt-2">{title}</span>
					</a>
				))}
			</div>
		</div>
	)
}
