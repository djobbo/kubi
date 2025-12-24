import { defineConfig } from "drizzle-kit"

const DATABASE_URL = process.env.DATABASE_URL

console.log("env", process.env)

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
