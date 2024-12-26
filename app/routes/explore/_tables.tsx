import { Trans } from "@lingui/react/macro"
import { createFileRoute, Link, Outlet } from "@tanstack/react-router"

import { getTables } from "@/features/db-explorer/functions/getTables"

export const Route = createFileRoute("/explore/_tables")({
  component: Explore,
  loader: async ({ context: { session } }) => {
    const tables = await getTables()
    return {
      session,
      tables,
    }
  },
})

function Explore() {
  const { tables } = Route.useLoaderData()
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">
        <Trans>Database Tables</Trans>
      </h1>
      <ul>
        {tables.map((table) => (
          <li key={table.name}>
            <Link to={`/explore/${table.schema}/${table.name}`}>
              {table.name}
            </Link>
          </li>
        ))}
      </ul>
      <Outlet />
    </div>
  )
}
