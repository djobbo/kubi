import { ChevronLeft, ChevronRight, ChevronsLeft } from "lucide-react"

import { Paginator } from "./Paginator"

interface PaginationProps {
  firstPage?: number
  lastPage?: number
  currentPage: number
  getPageHref: (page: string) => string
  span?: number
  className?: string
}

export const Pagination = ({
  currentPage,
  getPageHref,
  firstPage = 0,
  span = 1,
  className,
}: PaginationProps) => {
  const pages = [
    {
      page: firstPage.toString(),
      label: (
        <span className="flex items-center gap-1">
          {currentPage !== firstPage && <ChevronsLeft className="w-4 h-4" />}
          top
        </span>
      ),
    },
    ...Array.from({ length: 2 * span + 1 }, (_, i) => {
      const page = currentPage + i - span

      if (page <= firstPage) return null

      const label =
        page === currentPage - 1 ? (
          <span className="flex items-center gap-1">
            <ChevronLeft className="w-4 h-4" />
            prev
          </span>
        ) : page === currentPage + 1 ? (
          <span className="flex items-center gap-1">
            next
            <ChevronRight className="w-4 h-4" />
          </span>
        ) : (
          page.toString()
        )

      return {
        page: page.toString(),
        label,
      }
    }),
  ]
  return (
    <Paginator
      pages={pages}
      getPageHref={getPageHref}
      currentPage={currentPage.toString()}
      className={className}
    />
  )
}
