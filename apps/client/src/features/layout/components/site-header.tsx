import { SearchButton } from "@/features/search/components/search-button"
import { SidebarTrigger } from "@/shared/components/sidebar"
import { cn } from "@dair/common/src/helpers/ui"

export function SiteHeader({ className }: { className?: string }) {
  return (
    <header
      className={cn(
        "flex h-(--header-height) shrink-0 items-center gap-2 border-b border-border px-4",
        className,
      )}
    >
      <SidebarTrigger className="-ml-1" />
      <div className="h-4 w-px bg-border" />
      <div className="min-w-0 flex-1" />
      <SearchButton />
    </header>
  )
}
