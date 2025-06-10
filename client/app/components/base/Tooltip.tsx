import type { TooltipContentProps } from "@radix-ui/react-tooltip"
import {
	Arrow,
	Content,
	Portal,
	Provider,
	Root,
	Trigger,
} from "@radix-ui/react-tooltip"
import type { ReactNode } from "react"

import { cn } from "@/ui/lib/utils"

interface TooltipProps {
	content: ReactNode
	children: ReactNode
	delay?: number
	side?: TooltipContentProps["side"]
	align?: TooltipContentProps["align"]
	className?: string
}

export const Tooltip = ({
	content,
	delay = 0,
	children,
	side = "top",
	align = "center",
	className,
}: TooltipProps) => {
	return (
		<Provider delayDuration={delay}>
			<Root>
				<Trigger className="text-left" asChild>
					{children}
				</Trigger>
				<Portal>
					<Content
						side={side}
						align={align}
						className={cn(
							className,
							"px-4 py-2 bg-secondary border border-border rounded-lg shadow-md hidden hashover:block z-50",
						)}
					>
						{content}
						<Arrow className="mb-2 fill-border" />
					</Content>
				</Portal>
			</Root>
		</Provider>
	)
}
