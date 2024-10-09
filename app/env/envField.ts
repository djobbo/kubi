import type { z } from "zod"

export const envField = <T>(
  name: string,
  variable: string | undefined,
  schema: z.ZodType<T>,
  context: "client" | "server" = "server",
) => {
  const parsed = schema.safeParse(variable)
  const isClient = typeof window !== "undefined"
  const isWrongContext = context === "server" && isClient

  if (!parsed.success) {
    throw new Error(
      `Invalid environment variable: ${name} - ${variable} - ${parsed.error.message} ${process.env.NODE_ENV}`,
    )
  }

  if (isWrongContext) {
    throw new Error(
      `Environment variable ${variable} should not be used in the client`,
    )
  }

  return parsed.data
}
