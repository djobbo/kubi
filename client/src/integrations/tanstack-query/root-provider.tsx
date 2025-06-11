import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

const queryClient = new QueryClient()

export function getContext() {
	return {
		queryClient,
	}
}

export type Context = ReturnType<typeof getContext>

export function Provider({ children }: { children: React.ReactNode }) {
	return (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	)
}
