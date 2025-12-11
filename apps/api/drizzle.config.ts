import { defineConfig } from "drizzle-kit"

export default defineConfig({
  schema: "../../packages/db/src/index.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
