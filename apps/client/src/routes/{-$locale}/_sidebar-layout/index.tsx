import { SearchButton } from "@/features/search/components/search-button"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/{-$locale}/_sidebar-layout/")({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      Hello "/-$locale/_sidebar-layout/"!
      <SearchButton />
    </div>
  )
}
