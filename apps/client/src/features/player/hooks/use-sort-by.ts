import { useMemo, useState } from "react"
import type { ReactNode } from "react"

type CompareFn<ElementType> = {
  label: string
  sortFn: (a: ElementType, b: ElementType) => number
  displayFn?: (element: ElementType) => ReactNode
}

export enum SortDirection {
  Ascending = 1,
  Descending = -1,
}

export const useSortBy = <ElementType, Option extends string>(
  array: readonly ElementType[],
  compareFns: Record<Option, CompareFn<ElementType>>,
  defaultProp: Option,
  defaultDirection: SortDirection = SortDirection.Ascending,
) => {
  const [sortBy, setSortBy] = useState(defaultProp)
  const [sortDirection, setSortDirection] =
    useState<SortDirection>(defaultDirection)

  const sortedArray = useMemo(
    () =>
      array
        .slice(0)
        .sort((a, b) => compareFns[sortBy].sortFn(a, b) * sortDirection),
    [sortBy, array, compareFns, sortDirection],
  )

  const changeSortDirection = () => {
    setSortDirection(
      sortDirection === SortDirection.Ascending
        ? SortDirection.Descending
        : SortDirection.Ascending,
    )
  }

  return {
    sortedArray,
    sortBy,
    setSortBy,
    options: (
      Object.entries(compareFns) as [string, CompareFn<ElementType>][]
    ).map(([value, { label }]) => ({
      value,
      label,
    })) as { value: Option; label: string }[],
    sortDirection,
    changeSortDirection,
    displaySortFn: compareFns[sortBy].displayFn,
  } as const
}
