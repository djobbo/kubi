import { useLoaderData, useRouteContext, useRouter } from "@tanstack/react-router"

export const useRootContext = () => {
	const context = useRouteContext({ from: "__root__" })
	const router = useRouter()
	const loaderData = useLoaderData({ from: "__root__" })
	console.log(router.state.location.pathname, loaderData)
	return {
		...context,
		...loaderData,
	}
}
