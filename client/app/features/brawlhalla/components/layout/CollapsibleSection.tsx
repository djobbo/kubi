import type { ReactNode } from "react"

import { cn } from "@/ui/lib/utils"

import type { CollapsibleContentProps } from "./CollapsibleContent"
import { CollapsibleContent } from "./CollapsibleContent"
import { SectionTitle } from "./SectionTitle"

type CollapsibleSectionProps = Omit<CollapsibleContentProps, "trigger"> & {
	trigger: ReactNode
}

export const CollapsibleSection = ({
	className,
	triggerClassName,
	trigger,
	defaultOpen = true,
	...props
}: CollapsibleSectionProps) => {
	return (
		<CollapsibleContent
			className={cn("w-full", className)}
			triggerClassName={cn(
				"w-full text-left border-b border-border my-4",
				triggerClassName,
			)}
			trigger={(open) => (
				<SectionTitle
					customMargin
					className={cn("mt-0 flex items-center gap-2", {
						"text-muted-foreground": !open,
					})}
				>
					{trigger}
				</SectionTitle>
			)}
			defaultOpen={defaultOpen}
			{...props}
		/>
	)
}
