import { defineConfig } from "drizzle-kit"

import { env } from "@/env"

export default defineConfig({
  schema: "./app/db/schema.ts",
  out: "./app/migrations",
  dialect: "postgresql",
  dbCredentials: { url: env.DATABASE_URL },
})
