import { createFileRoute } from "@tanstack/react-router"
import { Route as PlayerRoute } from "./$playerId"
import { LegendsDataTable } from "./-data-table"

export const Route = createFileRoute("/players/$playerId/legends")({
	component: RouteComponent,
})

function RouteComponent() {
	const {
		data: { legends },
	} = PlayerRoute.useLoaderData()

	return <LegendsDataTable legends={legends} />
}
