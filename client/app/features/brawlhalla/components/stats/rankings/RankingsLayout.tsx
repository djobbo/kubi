import { t } from "@lingui/core/macro"
import type { Dispatch, ReactNode, SetStateAction } from "react"

import { Pagination } from "@/components/base/Pagination"
import type { PaginatorPage } from "@/components/base/Paginator"
import { Paginator } from "@/components/base/Paginator"
import { cn } from "@/ui/lib/utils"

interface RankingsLayoutProps {
  children: ReactNode
  currentBracket: string
  brackets: PaginatorPage[]
  currentRegion?: string
  regions: PaginatorPage[] | null
  currentPage?: string
  hasPagination?: boolean
  hasSearch?: boolean
  search?: string
  setSearch?: Dispatch<SetStateAction<string>>
  searchClassName?: string
  searchPlaceholder?: string
  searchSubtitle?: string
  defaultRegion?: string
  defaultBracket?: string
}

export const RankingsLayout = ({
  children,
  brackets,
  currentBracket,
  regions,
  currentRegion,
  currentPage,
  hasPagination = false,
  hasSearch = false,
  search,
  setSearch,
  searchClassName,
  searchPlaceholder = t`Search...`,
  searchSubtitle,
  defaultRegion = "all",
  defaultBracket = "1v1",
}: RankingsLayoutProps) => {
  const region = regions
    ? regions
        .map(({ page }) => page.toLowerCase())
        .includes(currentRegion?.toLowerCase() ?? "")
      ? currentRegion?.toLowerCase()
      : defaultRegion.toLowerCase()
    : null
  const bracket = brackets
    .map(({ page }) => page.toLowerCase())
    .includes(currentBracket.toLowerCase())
    ? currentBracket
    : defaultBracket
  const pagination =
    (currentPage && hasPagination && (
      <Pagination
        getPageHref={(page) =>
          region
            ? `/rankings/${bracket}/${region}${page ? `/${page}` : ""}`
            : `/rankings/${bracket}${page ? `/${page}` : ""}`
        }
        currentPage={parseInt(currentPage)}
        firstPage={1}
        className="mt-4 justify-end"
      />
    )) ??
    null

  return (
    <>
      <div className="w-full flex flex-row sm:flex-col items-center justify-center gap-2">
        <Paginator
          pages={brackets}
          currentPage={bracket}
          getPageHref={(bracket) =>
            region ? `/rankings/${bracket}/${region}` : `/rankings/${bracket}`
          }
          responsive
        />
        {regions && regions.length > 0 && (
          <Paginator
            pages={regions}
            currentPage={region ?? ""}
            getPageHref={(region) => `/rankings/${bracket}/${region}`}
            responsive
          />
        )}
      </div>
      {hasSearch && (
        <>
          <input
            value={search}
            onChange={(e) => {
              setSearch?.(e.target.value)
            }}
            className={cn(
              "w-full mt-4 px-4 py-2 border bg-secondary border-border rounded-lg",
              searchClassName,
            )}
            placeholder={searchPlaceholder}
          />
          {searchSubtitle && (
            <p className="text-center sm:text-left text-sm text-gray-400 mt-2">
              {searchSubtitle}
            </p>
          )}
        </>
      )}
      {pagination}
      <div className="py-4">{children}</div>
      {pagination}
    </>
  )
}
