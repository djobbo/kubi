import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/{-$locale}/_sidebar-layout/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/-$locale/_sidebar-layout/"!</div>
}