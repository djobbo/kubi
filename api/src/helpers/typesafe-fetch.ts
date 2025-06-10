import type z from "zod"
import { env } from "../env"

export const typesafeFetch =
	(name: string, baseUrl: string, searchParams?: Record<string, string>) =>
	async <T>(
		props: {
			path: string
			schema: z.ZodType<T>
			mock?: T
		},
		options?: RequestInit,
	): Promise<T> => {
		const { path, schema, mock } = props
		const url = new URL(path, baseUrl)

		if (searchParams) {
			for (const [key, value] of Object.entries(searchParams)) {
				url.searchParams.append(key, value)
			}
		}

		if (env.USE_MOCKS && mock) return mock

		const response = await fetch(url, options)

		if (!response.ok) {
			console.error("Brawlhalla API - Fetch Error", {
				status: response.status,
				path,
			})

			throw new Error(`Failed to fetch Brawlhalla API: ${response.statusText}`)
		}

		const json = await response.json()

		const safeParseResult = schema.safeParse(json)

		if (!safeParseResult.success) {
			console.error("Brawlhalla API - Parse Error", {
				path,
				error: safeParseResult.error,
			})
		}

		// Even if the parse fails, we still want to return the JSON,
		// the parsing is here to log undocumented API changes
		return json as T
	}
