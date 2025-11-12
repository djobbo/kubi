import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_sidenav/brawlhalla/players/$playerId/2v2')({
  component: RouteComponent,
  staleTime: 5 * 60 * 1000,
})

function RouteComponent() {
  return <div>Hello "/brawlhalla/players/$playerId/2v2"!</div>
}
