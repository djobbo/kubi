import { cn } from "@dair/common/src/helpers/ui"
import type { ReactNode } from "react"

export function Kbd({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <kbd
      className={cn(
        "flex h-5 min-w-5 items-center justify-center corner-smooth-sm bg-bg px-1 text-xs text-text-muted",
        className,
      )}
    >
      {children}
    </kbd>
  )
}
