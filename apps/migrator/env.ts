import { config } from "dotenv"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const migratorRoot = resolve(dirname(fileURLToPath(import.meta.url)))

config({ path: resolve(migratorRoot, ".env") })
config({ path: resolve(migratorRoot, "../../.env"), override: true })
