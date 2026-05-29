import { Tooltip as TooltipPrimitive } from "@base-ui-components/react/tooltip"
import { cn } from "@dair/common/src/helpers/ui"
import type { ComponentProps } from "react"

export function TooltipProvider(props: TooltipPrimitive.Provider.Props) {
  return <TooltipPrimitive.Provider delay={0} {...props} />
}

export function Tooltip({ ...props }: TooltipPrimitive.Root.Props) {
  return <TooltipPrimitive.Root {...props} />
}

export function TooltipTrigger(props: TooltipPrimitive.Trigger.Props) {
  return <TooltipPrimitive.Trigger {...props} />
}

export function TooltipContent({
  className,
  side = "right",
  sideOffset = 8,
  align = "center",
  children,
  ...props
}: TooltipPrimitive.Popup.Props &
  Pick<TooltipPrimitive.Positioner.Props, "align" | "side" | "sideOffset">) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        className="z-50"
      >
        <TooltipPrimitive.Popup
          className={cn(
            "corner-smooth-md bg-bg px-2 py-1 text-xs text-text shadow-md outline-1 outline-border",
            className,
          )}
          {...props}
        >
          {children}
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  )
}
