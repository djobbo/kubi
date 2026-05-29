import {
  isRankingsBracket,
  isRankingsRegion,
  RANKINGS_BRACKETS,
  RANKINGS_REGIONS,
  type RankingsBracket,
} from "@/features/rankings/constants"
import { cn } from "@dair/common/src/helpers/ui"
import { Link } from "@tanstack/react-router"
import type { ReactNode } from "react"

type RankingsLayoutProps = {
  children: ReactNode
  bracket: RankingsBracket
  region: string
  page: number
  hasPagination?: boolean
  hasSearch?: boolean
  search?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
  searchSubtitle?: string
}

const RankingsPaginator = ({
  pages,
  current,
  getHref,
}: {
  pages: ReadonlyArray<{ page: string; label: string }>
  current: string
  getHref: (page: string) => string
}) => (
  <div className="flex flex-wrap items-center justify-center gap-1">
    {pages.map(({ page, label }) => (
      <Link
        key={page}
        to={getHref(page)}
        className={cn(
          "rounded-md px-3 py-1.5 text-sm transition-colors",
          current === page
            ? "bg-primary/20 text-text font-medium"
            : "text-text-muted hover:bg-bg-light hover:text-text",
        )}
      >
        {label}
      </Link>
    ))}
  </div>
)

export const RankingsLayout = ({
  children,
  bracket,
  region,
  page,
  hasPagination = false,
  hasSearch = false,
  search = "",
  onSearchChange,
  searchPlaceholder = "Search...",
  searchSubtitle,
}: RankingsLayoutProps) => {
  const activeBracket = isRankingsBracket(bracket) ? bracket : "1v1"
  const activeRegion = isRankingsRegion(region) ? region : "all"

  return (
    <div className="flex flex-col gap-4">
      <RankingsPaginator
        pages={RANKINGS_BRACKETS}
        current={activeBracket}
        getHref={(nextBracket) =>
          `/brawlhalla/rankings/${nextBracket}/${activeRegion}/${page}`
        }
      />
      <RankingsPaginator
        pages={RANKINGS_REGIONS}
        current={activeRegion}
        getHref={(nextRegion) =>
          `/brawlhalla/rankings/${activeBracket}/${nextRegion}/${page}`
        }
      />
      {hasSearch && (
        <div className="flex flex-col gap-1">
          <input
            value={search}
            onChange={(event) => onSearchChange?.(event.target.value)}
            placeholder={searchPlaceholder}
            className={cn(
              "w-full rounded-lg border border-border bg-bg-light px-4 py-2",
              "text-sm text-text placeholder:text-text-muted",
            )}
          />
          {searchSubtitle ? (
            <p className="text-xs text-text-muted">{searchSubtitle}</p>
          ) : null}
        </div>
      )}
      {children}
      {hasPagination && !search ? (
        <div className="flex items-center justify-end gap-2">
          {page > 1 ? (
            <Link
              to={`/brawlhalla/rankings/${activeBracket}/${activeRegion}/${page - 1}`}
              className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-bg-light"
            >
              Previous
            </Link>
          ) : null}
          <span className="text-sm text-text-muted">Page {page}</span>
          <Link
            to={`/brawlhalla/rankings/${activeBracket}/${activeRegion}/${page + 1}`}
            className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-bg-light"
          >
            Next
          </Link>
        </div>
      ) : null}
    </div>
  )
}
