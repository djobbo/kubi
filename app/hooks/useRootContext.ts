import { Route } from "@/routes/__root"

export const useRootContext = () => {
  const context = Route.useRouteContext()
  return context
}
