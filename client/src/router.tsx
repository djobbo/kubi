import { createRouter as createTanstackRouter } from "@tanstack/react-router"
import { routerWithQueryClient } from "@tanstack/react-router-with-query"
import * as ApiClient from "./integrations/api-client/context"
import * as Lingui from "./integrations/lingui/root-provider"
import * as TanstackQuery from "./integrations/tanstack-query/root-provider"

import { DefaultCatchBoundary } from "@/components/DefaultCatchBoundary"
import { NotFound } from "@/components/NotFound"
import { routeTree } from "@/routeTree.gen"

import "./styles.css"
import type { ReactNode } from "react"

export type RouterContext = TanstackQuery.Context &
	Lingui.Context &
	ApiClient.Context

export const createRouter = () => {
	const context: RouterContext = {
		...TanstackQuery.getContext(),
		...Lingui.getContext(),
		...ApiClient.getContext(),
	}

	const router = routerWithQueryClient(
		createTanstackRouter({
			routeTree,
			context,
			defaultPreload: "intent",
			defaultPreloadStaleTime: 0,
			defaultPreloadDelay: 50,
			scrollRestoration: true,
			defaultStaleTime: 5 * 60 * 1000, // 5 minutes
			defaultGcTime: 10 * 60 * 1000, // 10 minutes
			defaultErrorComponent: DefaultCatchBoundary,
			defaultNotFoundComponent: NotFound,
			defaultStructuralSharing: true,
			Wrap: ({ children }: { children: ReactNode }) => {
				return (
					<Lingui.Provider>
						<TanstackQuery.Provider>{children}</TanstackQuery.Provider>
					</Lingui.Provider>
				)
			},
		}),
		TanstackQuery.getContext().queryClient,
	)

	return router
}

declare module "@tanstack/react-router" {
	interface Register {
		router: ReturnType<typeof createRouter>
	}
}
