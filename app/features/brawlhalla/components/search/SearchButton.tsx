import { Trans } from "@lingui/react/macro"
import { useKBar } from "kbar"
import { Search } from "lucide-react"

import { Button } from "@/ui/components/button"
import { CommandShortcut } from "@/ui/components/command"
import { cn } from "@/ui/lib/utils"

interface SearchButtonProps {
  className?: string
  customWidth?: boolean
}

export const SearchButton = ({ className, customWidth }: SearchButtonProps) => {
  const { query } = useKBar()

  return (
    <Button
      variant="outline"
      className={cn(className, "flex justify-between", {
        "w-48": !customWidth,
      })}
      onClick={query.toggle}
    >
      <span className="flex items-center gap-2">
        <Search className="w-4 h-4" />
        <Trans>Search player...</Trans>
      </span>
      <span className="hidden md:flex items-center gap-1 text-textVar1">
        <CommandShortcut>/</CommandShortcut>
      </span>
    </Button>
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
