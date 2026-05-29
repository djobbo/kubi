import { config } from "dotenv"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const apiRoot = resolve(dirname(fileURLToPath(import.meta.url)))

// Package .env first, then monorepo root (canonical for DATABASE_URL, Redis, etc.)
config({ path: resolve(apiRoot, ".env") })
config({ path: resolve(apiRoot, "../../.env"), override: true })
