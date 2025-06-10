import { z } from "zod"

export const envField = <T>(
	name: string,
	variable: unknown,
	schema: z.ZodType<T>,
	context: "client" | "server" = "server",
): T => {
	const isClient = typeof window !== "undefined"
	const isWrongContext = context === "server" && isClient

	if (isWrongContext) {
		try {
			// if the variable is present and the context is wrong, throw an error
			z.undefined().parse(variable)
			// fake the return type, since the variable will not be used
			// when the context is wrong
			return undefined as T
		} catch {
			throw new Error(
				`Environment variable ${name} should not be used in the client`,
			)
		}
	}

	const parsed = schema.safeParse(variable)

	if (!parsed.success) {
		throw new Error(
			`Invalid environment variable: ${name} - ${variable} - ${parsed.error.message}`,
		)
	}

	return parsed.data
}
