import { Rankings2v2Page } from "@/features/rankings/components/rankings-2v2-page"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute(
  "/{-$locale}/_sidebar-layout/brawlhalla/rankings/2v2/{-$region}/{-$page}",
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { region, page } = Route.useParams()

  return <Rankings2v2Page region={region ?? "all"} page={page ?? "1"} />
}
