import {
	type ColumnDef,
	type ColumnFiltersState,
	type SortingState,
	type VisibilityState,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react"
import type { Route as PlayerRoute } from "./$playerId"

import { Button } from "@/ui/components/button"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/ui/components/dropdown-menu"
import { Input } from "@/ui/components/input"
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/ui/components/table"
import { formatTime } from "@dair/common/src/helpers/date"
import { useState } from "react"

export type Legend = ReturnType<
	typeof PlayerRoute.useLoaderData
>["legends"][number]

export const columns: ColumnDef<
	Legend,
	{
		meta: {
			name: string
			defaultSort: "asc" | "desc"
		}
	}
>[] = [
	{
		id: "rank",
		header: () => null,
		cell: ({ row }) => {
			return <div className="text-right">{row.index + 1}</div>
		},
	},
	{
		id: "name",
		accessorKey: "name",
		meta: {
			name: "Name",
			defaultSort: "asc",
		},
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
				>
					Name
					<ArrowUpDown />
				</Button>
			)
		},
		cell: ({ row }) => {
			return <div className="capitalize">{row.getValue("name")}</div>
		},
	},
	{
		id: "xp",
		accessorKey: "stats.xp",
		meta: {
			name: "XP / Level",
			defaultSort: "desc",
		},
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
				>
					XP / Level
					<ArrowUpDown />
				</Button>
			)
		},
		cell: ({ row }) => {
			const { xp, level } = row.original.stats
			return (
				<div>
					Level {level} ({xp} XP)
				</div>
			)
		},
	},
	{
		id: "matchtime",
		accessorKey: "stats.matchtime",
		meta: {
			name: "Match Time",
			defaultSort: "desc",
		},
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
				>
					Match Time
					<ArrowUpDown />
				</Button>
			)
		},
		cell: ({ row }) => {
			const { matchtime } = row.original.stats
			return <div>{formatTime(matchtime)}</div>
		},
	},
	{
		id: "actions",
		enableHiding: false,
		cell: ({ row }) => {
			return (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" className="h-8 w-8 p-0">
							<span className="sr-only">Open menu</span>
							<MoreHorizontal />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuLabel>Actions</DropdownMenuLabel>
						<DropdownMenuItem
							onClick={() => navigator.clipboard.writeText(row.original.name)}
						>
							Copy name
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem>View player</DropdownMenuItem>
						<DropdownMenuItem>View stats</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			)
		},
	},
]

export function LegendsDataTable({ legends }: { legends: Legend[] }) {
	const [sorting, setSorting] = useState<SortingState>([
		{ id: "xp", desc: true },
	])
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
		name: true,
		xp: true,
		matchtime: true,
	})
	const [rowSelection, setRowSelection] = useState({})

	const table = useReactTable({
		data: legends,
		columns,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onColumnVisibilityChange: setColumnVisibility,
		onRowSelectionChange: setRowSelection,
		state: {
			sorting,
			columnFilters,
			columnVisibility,
			rowSelection,
		},
	})

	return (
		<div className="w-full">
			<div className="flex items-center py-4">
				<Input
					placeholder="Filter legends..."
					value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
					onChange={(event) =>
						table.getColumn("name")?.setFilterValue(event.target.value)
					}
					className="max-w-sm"
				/>
				{/* <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Weapons <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table.rows
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu> */}
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="outline" className="ml-auto">
							Sort By <ChevronDown />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuRadioGroup
							value={table.getState().sorting[0]?.id}
							onValueChange={(value) => {
								table.setSorting([
									{
										id: value,
										desc:
											table.getColumn(value)?.columnDef.meta?.defaultSort ===
											"desc",
									},
								])
								table.setColumnVisibility(() => {
									// hide all columns
									const newState = {} as Record<string, boolean>
									for (const column of table.getAllColumns()) {
										newState[column.id] = [
											"rank",
											"name",
											"actions",
											value === "name" ? "xp" : value,
										].includes(column.id)
									}
									return newState
								})
							}}
						>
							{table
								.getAllColumns()
								.filter((column) => column.getCanSort())
								.map((column) => {
									return (
										<DropdownMenuRadioItem
											key={column.id}
											className="capitalize"
											value={column.id}
										>
											{column.columnDef.meta?.name ?? column.id}
										</DropdownMenuRadioItem>
									)
								})}
						</DropdownMenuRadioGroup>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
			<div className="rounded-md border">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => {
									return (
										<TableHead key={header.id}>
											{header.isPlaceholder
												? null
												: flexRender(
														header.column.columnDef.header,
														header.getContext(),
													)}
										</TableHead>
									)
								})}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow
									key={row.id}
									data-state={row.getIsSelected() && "selected"}
								>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="h-24 text-center"
								>
									No results.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
			<div className="flex items-center justify-end space-x-2 py-4">
				<div className="text-muted-foreground flex-1 text-sm">
					{table.getFilteredSelectedRowModel().rows.length} of{" "}
					{table.getFilteredRowModel().rows.length} row(s) selected.
				</div>
				<div className="space-x-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => table.previousPage()}
						disabled={!table.getCanPreviousPage()}
					>
						Previous
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() => table.nextPage()}
						disabled={!table.getCanNextPage()}
					>
						Next
					</Button>
				</div>
			</div>
		</div>
	)
}
