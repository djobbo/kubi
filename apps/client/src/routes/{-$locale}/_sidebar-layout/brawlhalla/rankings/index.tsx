import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute(
  "/{-$locale}/_sidebar-layout/brawlhalla/rankings/",
)({
  beforeLoad: () => {
    throw redirect({
      to: "/brawlhalla/rankings/1v1/$region/$page",
      params: { region: "all", page: "1" },
    })
  },
})
