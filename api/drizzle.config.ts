import { defineConfig } from "drizzle-kit"

export default defineConfig({
	schema: "../packages/schema/src/index.ts",
	out: "./migrations",
	dialect: "sqlite",
	dbCredentials: { url: process.env.DATABASE_URL! },
})
