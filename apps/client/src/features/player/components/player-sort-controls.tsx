import { cn } from "@dair/common/src/helpers/ui"
import { Select } from "@base-ui-components/react/select"
import { t } from "@lingui/core/macro"
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CheckIcon,
  ChevronDownIcon,
} from "lucide-react"

import { SortDirection } from "../hooks/use-sort-by"

type PlayerSortControlsProps<Option extends string> = {
  sortBy: Option
  onSortByChange: (value: Option) => void
  options: { value: Option; label: string }[]
  sortDirection: SortDirection
  onSortDirectionChange: () => void
  className?: string
}

export const PlayerSortControls = <Option extends string>({
  sortBy,
  onSortByChange,
  options,
  sortDirection,
  onSortDirectionChange,
  className,
}: PlayerSortControlsProps<Option>) => {
  return (
    <div className={cn("flex flex-1 items-center gap-4", className)}>
      <Select.Root
        items={options}
        value={sortBy}
        onValueChange={(value) => onSortByChange(value as Option)}
      >
        <Select.Trigger
          className={cn(
            "flex h-10 flex-1 items-center justify-between gap-3",
            "rounded-md border border-border bg-bg px-3.5",
          )}
        >
          <Select.Value className="text-sm">
            {options.find(({ value }) => value === sortBy)?.label ?? t`Sort by`}
          </Select.Value>
          <Select.Icon className="flex">
            <ChevronDownIcon className="size-4" />
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Positioner
            className="z-20 outline-none select-none"
            sideOffset={8}
          >
            <Select.Popup className="corner-smooth-md bg-bg-root outline-1 outline-border">
              <Select.List className="relative scroll-py-6 overflow-y-auto py-1">
                {options.map(({ label, value }) => (
                  <Select.Item
                    key={value}
                    value={value}
                    className={cn(
                      "grid cursor-default grid-cols-[0.75rem_1fr] items-center gap-2 py-2 pr-4 pl-2.5 text-sm leading-4 outline-none select-none",
                      "data-[highlighted]:before:absolute data-[highlighted]:before:inset-x-1 data-[highlighted]:before:inset-y-0 data-[highlighted]:before:z-[-1] data-[highlighted]:before:rounded-sm data-[highlighted]:before:bg-bg-light",
                    )}
                  >
                    <Select.ItemIndicator className="col-start-1">
                      <CheckIcon className="size-3" />
                    </Select.ItemIndicator>
                    <Select.ItemText className="col-start-2">
                      {label}
                    </Select.ItemText>
                  </Select.Item>
                ))}
              </Select.List>
            </Select.Popup>
          </Select.Positioner>
        </Select.Portal>
      </Select.Root>
      <button
        type="button"
        onClick={onSortDirectionChange}
        className="flex items-center text-text-muted hover:text-text"
        aria-label={t`Toggle sort direction`}
      >
        {sortDirection === SortDirection.Ascending ? (
          <ArrowUpIcon className="size-5" />
        ) : (
          <ArrowDownIcon className="size-5" />
        )}
      </button>
    </div>
  )
}
