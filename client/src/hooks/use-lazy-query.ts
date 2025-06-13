import type {
	FetchQueryOptions,
	QueryKey,
} from "@tanstack/react-query"
import { useQueryClient } from "@tanstack/react-query"
import { useCallback, useMemo, useState } from "react"

export function useLazyQuery<
	TQueryFnData = unknown,
	TError = unknown,
	TData = TQueryFnData,
	TQueryKey extends QueryKey = QueryKey,
>(options: FetchQueryOptions<TQueryFnData, TError, TData, TQueryKey>) {
	const queryClient = useQueryClient()

	const [data, setData] = useState<TData>()
	const [isLoading, setIsLoading] = useState(false)

	const trigger = useCallback(async () => {
		setIsLoading(true)

		return await queryClient.ensureQueryData(options).then((res) => {
			setData(res)
			setIsLoading(false)

			return res
		})
	}, [options, queryClient])

	const result = useMemo(
		() => ({
			trigger,
			isLoading,
			data,
		}),
		[data, isLoading, trigger],
	)

	return result
}
