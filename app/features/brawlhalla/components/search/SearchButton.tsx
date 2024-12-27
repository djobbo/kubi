import { Trans } from "@lingui/react/macro"
import { useKBar } from "kbar"
import { Search } from "lucide-react"

import { Kbd } from "@/components/base/Kbd"
import { getCurrentDevice } from "@/helpers/devices"
import { cn } from "@/ui/lib/utils"

interface SearchButtonProps {
  className?: string
  bg?: string
  customWidth?: boolean
}

export const SearchButton = ({
  className,
  bg,
  customWidth,
}: SearchButtonProps) => {
  const { query } = useKBar()
  const device = getCurrentDevice()

  return (
    <button
      type="button"
      className={cn(
        className,
        "rounded-lg py-1.5 px-2 cursor-text text-sm flex items-center justify-between border border-bg text-textVar1 hover:text-text hover:border-textVar1",
        {
          "w-48": !customWidth,
        },
        bg ?? "bg-bgVar2",
      )}
      onClick={query.toggle}
    >
      <span>
        <Trans>Search player...</Trans>
      </span>
      {["mac", "pc"].includes(device) && (
        <span className="flex items-center gap-1 text-textVar1">
          <Kbd>/</Kbd>
        </span>
      )}
    </button>
  )
}

interface SearchButtonIconProps {
  className?: string
  size?: number
}

export const SearchButtonIcon = ({
  className,
  size,
}: SearchButtonIconProps) => {
  const { query } = useKBar()

  return (
    <button type="button" className={className} onClick={query.toggle}>
      <Search size={size ?? 20} />
    </button>
  )
}
