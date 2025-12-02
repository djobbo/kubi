import { cn } from "@dair/common/src/helpers/ui"
import type { ComponentProps, ReactNode } from "react"

type StatGridProps = ComponentProps<"div"> & {
  stats: { title: string; value: ReactNode; description?: string }[]
}

export const StatGrid = ({ stats, className, ...props }: StatGridProps) => {
  return (
    <div
      {...props}
      className={cn(
        "grid grid-cols-1 gap-4 @sm:grid-cols-2 @md:grid-cols-3 @xl:grid-cols-4 @5xl:grid-cols-6",
        className,
      )}
    >
      {stats.map((stat) => (
        <div key={stat.title} className="flex flex-col">
          <span className="text-xs text-text-muted uppercase">
            {stat.title}
          </span>
          <span>{stat.value}</span>
        </div>
      ))}
    </div>
  )
}
