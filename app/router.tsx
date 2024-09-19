import {createRouter as createTanStackRouter} from "@tanstack/react-router"

import {Error} from "./components/Error"
import {NotFound} from "./components/NotFound"
import {routeTree} from "./routeTree.gen"

export function createRouter() {
  const router = createTanStackRouter({
    routeTree,
    defaultPreload: "intent",
    defaultErrorComponent: Error,
    defaultNotFoundComponent: NotFound,
  })

  return router
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createRouter>
  }
}
