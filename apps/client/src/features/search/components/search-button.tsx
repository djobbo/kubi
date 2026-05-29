import { searchOpenAtom } from "@/features/search/helpers/search-open-atom"
import { Kbd } from "@/shared/components/kbd"
import { useIsMobile } from "@/shared/hooks/use-is-mobile"
import { cn } from "@dair/common/src/helpers/ui"
import { useAtomSet } from "@effect/atom-react"
import { Trans } from "@lingui/react/macro"
import { SearchIcon } from "lucide-react"
import type { ComponentProps } from "react"

const openSearch = (setSearchOpen: (open: boolean) => void) => {
  setSearchOpen(true)
}

type SearchButtonProps = ComponentProps<"button"> & {
  bg?: "bg" | "bg-dark"
}

export function SearchButton({
  className,
  bg = "bg-dark",
  ...props
}: SearchButtonProps) {
  const setSearchOpen = useAtomSet(searchOpenAtom)
  const isMobile = useIsMobile()

  return (
    <button
      type="button"
      className={cn(
        "flex w-48 cursor-text items-center justify-between corner-smooth-lg border border-border px-2 py-1.5 text-sm text-text-muted",
        "hover:border-text-muted hover:text-text",
        bg === "bg-dark" ? "bg-bg-dark" : "bg-bg",
        className,
      )}
      onClick={() => openSearch(setSearchOpen)}
      {...props}
    >
      <span>
        <Trans>Search player...</Trans>
      </span>
      {!isMobile && <Kbd>/</Kbd>}
    </button>
  )
}

type SearchButtonIconProps = ComponentProps<"button"> & {
  size?: number
}

export function SearchButtonIcon({
  className,
  size = 22,
  ...props
}: SearchButtonIconProps) {
  const setSearchOpen = useAtomSet(searchOpenAtom)

  return (
    <button
      type="button"
      className={cn(
        "flex items-center justify-center px-2 text-text-muted hover:text-text",
        className,
      )}
      onClick={() => openSearch(setSearchOpen)}
      {...props}
    >
      <SearchIcon size={size} />
      <span className="sr-only">
        <Trans>Search</Trans>
      </span>
    </button>
  )
}
