import { defineConfig } from "drizzle-kit"

import { env } from "./src/env"

export default defineConfig({
	schema: "./packages/schema/src/index.ts",
	out: "./migrations",
	dialect: "sqlite",
	dbCredentials: { url: env.DATABASE_URL },
})
