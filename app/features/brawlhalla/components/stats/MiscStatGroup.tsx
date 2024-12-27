import type { ReactNode } from "react"

import { Tooltip } from "@/components/base/Tooltip"
import { cn } from "@/ui/lib/utils"
import { css } from "@/ui/theme"

export interface MiscStat {
  name: string
  value: ReactNode
  desc: string
}

interface MiscStatGroupProps {
  fit?: "fit" | "fill"
  className?: string
  minItemWidth?: string
  stats: MiscStat[]
  gapClassName?: string
  column?: boolean
}

export const MiscStatGroup = ({
  fit = "fill",
  className,
  stats,
  minItemWidth = "8rem",
  gapClassName = "gap-x-12 gap-y-4",
  column,
}: MiscStatGroupProps) => {
  const containerClassName = column
    ? // eslint-disable-next-line lingui/no-unlocalized-strings
      ["flex flex-col"]
    : [
        "grid",
        css({
          // eslint-disable-next-line lingui/no-unlocalized-strings
          gridTemplateColumns: `repeat(auto-${fit}, minmax(${minItemWidth}, 1fr))`,
        })(),
      ]

  return (
    <div className={cn(gapClassName, containerClassName, className)}>
      {stats.map(({ name, value, desc }) => (
        <div
          key={name}
          className={cn({
            "flex items-center gap-2": column,
          })}
        >
          <Tooltip content={desc}>
            <p className="text-sm text-textVar1">{name}</p>
          </Tooltip>
          <div
            className={cn("font-semibold text-lg", {
              "mt-2": !column,
            })}
          >
            {value}
          </div>
        </div>
      ))}
    </div>
  )
}
