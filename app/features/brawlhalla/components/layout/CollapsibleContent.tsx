import { Content, Root, Trigger } from "@radix-ui/react-collapsible"
import { ChevronDown, ChevronUp } from "lucide-react"
import type { ReactNode } from "react"
import { useState } from "react"

import { cn } from "@/ui/lib/utils"

export interface CollapsibleContentProps {
  className?: string
  triggerClassName?: string
  contentClassName?: string
  children: ReactNode
  trigger: ReactNode | ((open: boolean) => ReactNode)
  hasArrow?: boolean
  arrowClassName?: string
  defaultOpen?: boolean
  closingArrow?: boolean
}

export const CollapsibleContent = ({
  className,
  triggerClassName,
  contentClassName,
  trigger,
  children,
  hasArrow = true,
  arrowClassName = "text-muted-foreground",
  defaultOpen = false,
  closingArrow,
}: CollapsibleContentProps) => {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <Root open={open} onOpenChange={setOpen} className={className}>
      <Trigger
        className={cn(
          "w-full flex items-center justify-between",
          triggerClassName,
        )}
      >
        <span className="flex-1">
          {typeof trigger === "function" ? trigger(open) : trigger}
        </span>
        {hasArrow &&
          (open ? (
            <ChevronUp className={arrowClassName} />
          ) : (
            <ChevronDown className={arrowClassName} />
          ))}
      </Trigger>
      <Content className={contentClassName}>
        {children}
        {closingArrow && (
          <button
            type="button"
            className="w-full flex items-center justify-center mt-4 text-muted-foreground"
            onClick={() => setOpen(false)}
          >
            <ChevronUp />
          </button>
        )}
      </Content>
    </Root>
  )
}
