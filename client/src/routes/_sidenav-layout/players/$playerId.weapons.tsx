import { createFileRoute } from "@tanstack/react-router"
import { Route as PlayerRoute } from "./$playerId"
import { WeaponsDataTable } from "./-weapons-data-table"

export const Route = createFileRoute("/_sidenav-layout/players/$playerId/weapons")({
	component: RouteComponent,
})

function RouteComponent() {
	const {
		data: { weapons },
	} = PlayerRoute.useLoaderData()

	return <WeaponsDataTable weapons={weapons} />
}
