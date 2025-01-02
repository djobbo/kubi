import type { ReactNode } from "react"

import { Tooltip } from "@/components/base/Tooltip"
import { cva } from "@/panda/css"
import { cn } from "@/ui/lib/utils"

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
  direction?: "row" | "column"
}

export const MiscStatGroup = ({
  fit = "fill",
  className,
  stats,
  minItemWidth = "8rem",
  gapClassName = "gap-x-12 gap-y-4",
  direction = "row",
}: MiscStatGroupProps) => {
  const containerClassName = cva({
    variants: {
      direction: {
        row: {
          display: "grid",
          gridTemplateColumns: `repeat(auto-${fit}, minmax(${minItemWidth}, 1fr)`,
        },
        column: { display: "flex", flexDirection: "column" },
      },
    },
  })

  const isColumn = direction === "column"

  return (
    <div
      className={cn(gapClassName, containerClassName({ direction }), className)}
    >
      {stats.map(({ name, value, desc }) => (
        <div
          key={name}
          className={cn({
            "flex items-center gap-2": isColumn,
          })}
        >
          <Tooltip content={desc}>
            <p className="text-sm text-textVar1">{name}</p>
          </Tooltip>
          <div
            className={cn("font-semibold text-lg", {
              "mt-2": !isColumn,
            })}
          >
            {value}
          </div>
        </div>
      ))}
    </div>
  )
}
