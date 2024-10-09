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
      // eslint-disable-next-line lingui/no-unlocalized-strings
      `Invalid environment variable: ${name} - ${variable} - ${parsed.error.message}`,
    )
  }

  if (isWrongContext) {
    throw new Error(
      // eslint-disable-next-line lingui/no-unlocalized-strings
      `Environment variable ${variable} should not be used in the client`,
    )
  }

  return parsed.data
}
