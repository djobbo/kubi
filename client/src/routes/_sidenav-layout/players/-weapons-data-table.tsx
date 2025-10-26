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

export type Weapon = ReturnType<
	typeof PlayerRoute.useLoaderData
>["weapons"][number]

export const columns: ColumnDef<
	Weapon,
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
		id: "time_held",
		accessorKey: "stats.time_held",
		meta: {
			name: "Time Held",
			defaultSort: "desc",
		},
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
				>
					Time Held
					<ArrowUpDown />
				</Button>
			)
		},
		cell: ({ row }) => {
			const { time_held } = row.original.stats
			return <div>{formatTime(time_held)}</div>
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

export function WeaponsDataTable({ weapons }: { weapons: Weapon[] }) {
	const [sorting, setSorting] = useState<SortingState>([
		{ id: "time_held", desc: true },
	])
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
		name: true,
		time_held: true,
	})
	const [rowSelection, setRowSelection] = useState({})

	const table = useReactTable({
		data: weapons,
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
											value === "name" ? "time_held" : value,
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
		</div>
	)
}
