import { Trans } from "@lingui/react/macro"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/explore/_tables/")({
  component: RouteComponent,
})

function RouteComponent() {
  return <Trans>Please select a table to get started</Trans>
}
