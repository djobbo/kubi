import { cn, type VariantProps, cva } from "@dair/common/src/helpers/ui"
import { Link, type LinkProps } from "@tanstack/react-router"
import type { ComponentProps } from "react"

const tabVariants = cva(
	cn(
		"relative text-sm text-text-muted h-12 flex items-center justify-center px-4",
		"hover:bg-linear-to-b hover:from-bg hover:to-primary/25",
		"after:content-[''] after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:border-b after:border-primary-light hover:after:h-px hover:after:-bottom-1 after:transition-all",
		"after:pointer-events-none hover:after:opacity-100",
	),
	{
		variants: {
			active: {
				true: "after:bg-primary-light",
				false: "after:opacity-0",
			},
			defaultVariants: {
				active: false,
			},
		},
	},
)

type TabProps = LinkProps &
	ComponentProps<"a"> &
	VariantProps<typeof tabVariants>

export const Tab = ({ children, className, active, ...props }: TabProps) => {
	return (
		<Link className={cn(tabVariants({ active }), className)} {...props}>
			{children}
		</Link>
	)
}
