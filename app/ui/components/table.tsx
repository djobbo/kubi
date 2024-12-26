import type {
  HTMLAttributes,
  RefObject,
  TdHTMLAttributes,
  ThHTMLAttributes,
} from "react"

import { cn } from "@/ui/lib/utils"

const Table = ({
  ref,
  className,
  ...props
}: HTMLAttributes<HTMLTableElement> & {
  ref?: RefObject<HTMLTableElement>
}) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-sm", className)}
      {...props}
    />
  </div>
)
Table.displayName = "Table"

const TableHeader = ({
  ref,
  className,
  ...props
}: HTMLAttributes<HTMLTableSectionElement> & {
  ref?: RefObject<HTMLTableSectionElement>
}) => (
  <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
)
TableHeader.displayName = "TableHeader"

const TableBody = ({
  ref,
  className,
  ...props
}: HTMLAttributes<HTMLTableSectionElement> & {
  ref?: RefObject<HTMLTableSectionElement>
}) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
)
TableBody.displayName = "TableBody"

const TableFooter = ({
  ref,
  className,
  ...props
}: HTMLAttributes<HTMLTableSectionElement> & {
  ref?: RefObject<HTMLTableSectionElement>
}) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
      className,
    )}
    {...props}
  />
)
TableFooter.displayName = "TableFooter"

const TableRow = ({
  ref,
  className,
  ...props
}: HTMLAttributes<HTMLTableRowElement> & {
  ref?: RefObject<HTMLTableRowElement>
}) => (
  <tr
    ref={ref}
    className={cn(
      "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
      className,
    )}
    {...props}
  />
)
TableRow.displayName = "TableRow"

const TableHead = ({
  ref,
  className,
  ...props
}: ThHTMLAttributes<HTMLTableCellElement> & {
  ref?: RefObject<HTMLTableCellElement>
}) => (
  <th
    ref={ref}
    className={cn(
      "h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
      className,
    )}
    {...props}
  />
)
TableHead.displayName = "TableHead"

const TableCell = ({
  ref,
  className,
  ...props
}: TdHTMLAttributes<HTMLTableCellElement> & {
  ref?: RefObject<HTMLTableCellElement>
}) => (
  <td
    ref={ref}
    className={cn(
      "p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
      className,
    )}
    {...props}
  />
)
TableCell.displayName = "TableCell"

const TableCaption = ({
  ref,
  className,
  ...props
}: HTMLAttributes<HTMLTableCaptionElement> & {
  ref?: RefObject<HTMLTableCaptionElement>
}) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-muted-foreground", className)}
    {...props}
  />
)
TableCaption.displayName = "TableCaption"

export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
}
