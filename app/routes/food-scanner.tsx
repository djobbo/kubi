import { createFileRoute } from "@tanstack/react-router"

import { Scanner } from "@/features/food-reporter/components/Scanner"

export const Route = createFileRoute("/food-scanner")({
  component: () => (
    <div>
      <Scanner />
    </div>
  ),
})
