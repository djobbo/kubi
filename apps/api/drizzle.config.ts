import { config } from "dotenv"
import { resolve } from "node:path"
import { defineConfig } from "drizzle-kit"

// Root .env is canonical for DATABASE_URL; apps/api/.env may hold stale copies.
config({ path: resolve(import.meta.dirname, ".env") })
config({ path: resolve(import.meta.dirname, "../../.env"), override: true })

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is not set")
}

export default defineConfig({
  schema: "../../packages/db/src/index.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: DATABASE_URL,
  },
})
