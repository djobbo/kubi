import { Rankings1v1Page } from "@/features/rankings/components/rankings-1v1-page"
import { createFileRoute } from "@tanstack/react-router"
import { Schema } from "effect"

const SearchSchema = Schema.Struct({
  player: Schema.optional(Schema.String),
})

const decodeSearch = Schema.decodeUnknownPromise(SearchSchema)

export const Route = createFileRoute(
  "/{-$locale}/_sidebar-layout/brawlhalla/rankings/1v1/{-$region}/{-$page}",
)({
  component: RouteComponent,
  validateSearch: (search) => decodeSearch(search),
})

function RouteComponent() {
  const { region, page } = Route.useParams()
  const { player } = Route.useSearch()

  return (
    <Rankings1v1Page
      region={region ?? "all"}
      page={page ?? "1"}
      playerSearch={player}
    />
  )
}
