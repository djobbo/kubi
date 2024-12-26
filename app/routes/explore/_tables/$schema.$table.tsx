import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"

import { DataTableDemo } from "@/features/db-explorer/components/data-table"
import {
  getTableColumns,
  getTableData,
} from "@/features/db-explorer/functions/getTables"

const searchSchema = z.object({
  page: z.coerce.number().optional(),
  pageSize: z.coerce.number().optional(),
})

export const Route = createFileRoute("/explore/_tables/$schema/$table")({
  component: Explore,
  validateSearch: (search) => searchSchema.parse(search),
  loaderDeps(opts) {
    return opts.search
  },
  loader: async ({
    context: { session },
    params: { schema, table },
    deps: { page, pageSize },
  }) => {
    const columns = await getTableColumns({ data: { schema, table } })
    const data = await getTableData({ data: { schema, table, page, pageSize } })

    return {
      session,
      columns,
      data,
    }
  },
})

function Explore() {
  const { columns, data } = Route.useLoaderData()
  return (
    <div>
      {/* <ul>
        {columns.map((column) => (
          <li key={column.name}>
            {column.name} ({column.type})
          </li>
        ))}
      </ul> */}

      <DataTableDemo columns={columns} data={data.rows} />

      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.name}>{column.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.rows.map((row) => (
            <tr key={row.id}>
              {columns.map((column) => (
                <td key={column.name}>{row[column.name]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
