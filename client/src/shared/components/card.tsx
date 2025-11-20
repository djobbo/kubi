import { cn, type VariantProps, cva } from "@dair/common/src/helpers/ui"
import type { ComponentProps } from "react"

const cardVariants = cva("corner-smooth-2xl p-4", {
	variants: {
		variant: {
			default: "bg-bg shadow-lg",
			inset: "bg-bg-dark border border-border corner-smooth-lg",
			dashed: "border border-border border-dashed",
		},
	},
	defaultVariants: {
		variant: "default",
	},
})

type CardProps = ComponentProps<"div"> & VariantProps<typeof cardVariants>

export const Card = ({ children, className, variant, ...props }: CardProps) => {
	return (
		<div className={cn(cardVariants({ variant }), className)} {...props}>
			{children}
		</div>
	)
}
