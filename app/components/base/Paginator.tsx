import { Link, useNavigate } from "@tanstack/react-router"
import type { ReactNode } from "react"

import { cn } from "@/ui/lib/utils"

import { Select } from "./Select"

export interface PaginatorPage {
  page: string
  label?: ReactNode
}

interface PaginatorProps {
  pages: (PaginatorPage | null)[]
  currentPage: string
  getPageHref: (page: string) => string
  className?: string
  responsive?: boolean
}

export const Paginator = ({
  pages,
  currentPage,
  getPageHref,
  className,
  responsive,
}: PaginatorProps) => {
  const navigate = useNavigate()

  return (
    <>
      <Select
        className={cn("flex-1 w-full", className, {
          "block sm:hidden": responsive,
          hidden: !responsive,
        })}
        onChange={(page) => {
          navigate({
            to: getPageHref(page),
          })
        }}
        value={currentPage}
        options={pages.map((page) => ({
          label:
            typeof page?.label === "string" ? page.label : (page?.page ?? ""),
          value: page?.page ?? "",
        }))}
      />
      <div
        className={cn("flex items-center gap-2", className, {
          "hidden sm:flex": responsive,
        })}
      >
        {pages.map((pageData) => {
          if (!pageData) return null

          const { page, label } = pageData

          return (
            <Link
              key={page}
              to={getPageHref(page)}
              className={cn(
                "p-2 h-8 flex items-center justify-center text-sm rounded-lg border-bg whitespace-nowrap",
                {
                  "bg-accent": page === currentPage,
                  "bg-bgVar2": page !== currentPage,
                },
              )}
            >
              {label ?? page}
            </Link>
          )
        })}
      </div>
    </>
  )
}
