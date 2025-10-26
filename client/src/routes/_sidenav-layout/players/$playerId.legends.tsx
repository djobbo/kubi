import { createFileRoute } from "@tanstack/react-router"
import { Route as PlayerRoute } from "./$playerId"
import { LegendsDataTable } from "./-legends-data-table"

export const Route = createFileRoute("/_sidenav-layout/players/$playerId/legends")({
	component: RouteComponent,
})

function RouteComponent() {
	const {
		data: { legends },
	} = PlayerRoute.useLoaderData()

	return <LegendsDataTable legends={legends} />
}
