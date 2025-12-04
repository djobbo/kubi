import alchemy from "alchemy"
import { D1Database, Worker } from "alchemy/cloudflare"

const app = await alchemy("dair-api")

const database = await D1Database("dair-db", {
  name: "dair-db",
  migrationsDir: "./migrations",
})

export const worker = await Worker("dair-api", {
  entrypoint: "src/index.ts",
  compatibilityFlags: ["nodejs_compat_v2"],
  bindings: {
    DATABASE: database,
  },
})

console.log(`Worker deployed at: ${worker.url}`)
await app.finalize()
