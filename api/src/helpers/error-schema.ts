import { resolver } from "hono-openapi/zod"
import { z } from "zod"

export const getOpenAPIErrorResponse = (message: string) => {
	return {
		description: message,
		content: {
			"application/json": {
				schema: resolver(
					z.object({
						error: z.object({
							code: z.number(),
							message: z.string(),
							details: z.array(z.string()).optional(),
						}),
					}),
				),
			},
		},
	}
}
