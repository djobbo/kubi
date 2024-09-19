import { defineConfig } from "drizzle-kit"
import { env } from "@/features/env"

export default defineConfig({
  schema: "./features/db/schema/index.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
})
