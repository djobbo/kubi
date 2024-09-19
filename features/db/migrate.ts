import { drizzle } from "drizzle-orm/postgres-js"
import { migrate } from "drizzle-orm/postgres-js/migrator"
import postgres from "postgres"

import { env } from "@/features/env"

const client = postgres(env.DATABASE_URL, { max: 1 })
const db = drizzle(client)

try {
  await migrate(db, { migrationsFolder: "./migrations" })
  console.log("Migration complete")
}
catch (error) {
  console.error("Migration failed", error)
  process.exit(1)
}
finally {
  client.end()
}
