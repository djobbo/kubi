import {
	useLoaderData,
	useRouteContext,
	useRouter,
} from "@tanstack/react-router"

export const useRootContext = () => {
	const context = useRouteContext({ from: "__root__" })
	const loaderData = useLoaderData({ from: "__root__" })

	return {
		...context,
		...loaderData,
	}
}
