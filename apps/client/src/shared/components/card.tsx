import { cn, type VariantProps, cva } from "@dair/common/src/helpers/ui"
import type { ComponentProps } from "react"

const cardVariants = cva("corner-smooth-xl p-4", {
  variants: {
    variant: {
      default: "shadow-xl",
      inset: "border border-border bg-bg-dark",
      dashed: "border border-border border-dashed",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

type CardProps = ComponentProps<"div"> & VariantProps<typeof cardVariants>

export const Card = ({ children, className, variant, ...props }: CardProps) => {
  if (variant === "dashed") {
    return (
      <div className={cn(cardVariants({ variant }), className)} {...props}>
        {children}
      </div>
    )
  }

  if (variant === "inset") {
    return (
      <div className={cn(cardVariants({ variant }), className)} {...props}>
        {children}
      </div>
    )
  }

  return (
    <div
      className="corner-smooth-lg overflow-hidden p-px card-inset-border"
      {...props}
    >
      <div
        className={cn("corner-smooth-lg h-full min-h-0 bg-bg p-4", className)}
      >
        {children}
      </div>
    </div>
  )
}
