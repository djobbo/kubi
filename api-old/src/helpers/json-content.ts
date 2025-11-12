import { z } from "@hono/zod-openapi"
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers"

export { jsonContent, jsonContentRequired }

export const jsonErrorContent = <TCode extends readonly [string, ...string[]]>(
	codes: TCode,
	description: string,
) => {
	return jsonContent(
		z.object({
			error: z.object({
				code: z.enum(codes),
				message: z.string(),
				details: z.array(z.string()).optional(),
			}),
		}),
		description,
	)
}
