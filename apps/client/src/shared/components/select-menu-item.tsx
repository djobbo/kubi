import { cn } from "@dair/common/src/helpers/ui"
import { Select } from "@base-ui-components/react/select"
import { CheckIcon } from "lucide-react"
import type { ReactNode } from "react"

const selectMenuItemClassName = cn(
  "grid cursor-default grid-cols-[0.75rem_1fr] items-center gap-2 py-2 pr-4 pl-2.5 text-sm leading-4 outline-none select-none",
  "data-[highlighted]:before:absolute data-[highlighted]:before:inset-x-1 data-[highlighted]:before:inset-y-0 data-[highlighted]:before:z-[-1] data-[highlighted]:before:rounded-sm data-[highlighted]:before:bg-bg-light",
)

export const searchSelectMenuItemClassName = cn(
  "grid cursor-default grid-cols-[0.75rem_1fr] items-center gap-2 py-2 pr-4 pl-2.5 text-sm leading-4 outline-none select-none",
  "group-data-[side=none]:pr-12 group-data-[side=none]:text-base group-data-[side=none]:leading-4",
  "data-[highlighted]:relative data-[highlighted]:z-0 data-[highlighted]:text-gray-50",
  "data-[highlighted]:before:absolute data-[highlighted]:before:inset-x-1 data-[highlighted]:before:inset-y-0 data-[highlighted]:before:z-[-1] data-[highlighted]:before:rounded-sm data-[highlighted]:before:bg-gray-900",
  "pointer-coarse:py-2.5 pointer-coarse:text-[0.925rem]",
)

type SelectMenuItemProps = {
  value: string
  label: ReactNode
  className?: string
}

export const SelectMenuItem = ({
  value,
  label,
  className = selectMenuItemClassName,
}: SelectMenuItemProps) => (
  <Select.Item value={value} className={className}>
    <Select.ItemIndicator className="col-start-1">
      <CheckIcon className="size-3" />
    </Select.ItemIndicator>
    <Select.ItemText className="col-start-2">{label}</Select.ItemText>
  </Select.Item>
)
