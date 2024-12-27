import type { ReactNode } from "react"

import { cn } from "@/ui/lib/utils"
import { css } from "@/ui/theme"

interface KbdProps {
  children: ReactNode
  className?: string
}

const kbdClassName = css({
  minWidth: "1.25rem",
  height: "1.25rem",
})()

export const Kbd = ({ children, className }: KbdProps) => (
  <kbd
    className={cn(
      kbdClassName,
      "rounded-md hidden hashover:flex items-center justify-center px-1 bg-bg text-xs",
      className,
    )}
  >
    {children}
  </kbd>
)
