import { useRouteContext } from "@tanstack/react-router"

export const useRootContext = () => {
  const context = useRouteContext({ from: "__root__" })
  return context
}
