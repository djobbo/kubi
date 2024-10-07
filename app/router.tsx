import { i18n } from "@lingui/core"
import { I18nProvider } from "@lingui/react"
import { QueryClient } from "@tanstack/react-query"
import { createRouter as createTanStackRouter } from "@tanstack/react-router"
import { routerWithQueryClient } from "@tanstack/react-router-with-query"

import { DefaultCatchBoundary } from "@/components/DefaultCatchBoundary"
import { NotFound } from "@/components/NotFound"
import { messages as enMessages } from "@/locales/en/messages"
import { messages as frMessages } from "@/locales/fr/messages"
import { routeTree } from "@/routeTree.gen"

i18n.load({
  en: enMessages,
  fr: frMessages,
})
i18n.activate("fr")

export function createRouter() {
  const queryClient = new QueryClient()

  return routerWithQueryClient(
    createTanStackRouter({
      routeTree,
      context: { queryClient },
      defaultPreload: "intent",
      defaultErrorComponent: DefaultCatchBoundary,
      defaultNotFoundComponent: () => <NotFound />,
      Wrap: function WrapComponent({ children }) {
        return <I18nProvider i18n={i18n}>{children}</I18nProvider>
      },
    }),
    queryClient,
  )
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createRouter>
  }
}
