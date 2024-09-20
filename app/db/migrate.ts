import {drizzle} from "drizzle-orm/postgres-js"
import {migrate} from "drizzle-orm/postgres-js/migrator"
import postgres from "postgres"

import {env} from "@/env"

const client = postgres(env.DATABASE_URL, {max: 1})
const db = drizzle(client)

try {
  await migrate(db, {migrationsFolder: "./migrations"})
  // eslint-disable-next-line no-console
  console.log("Migration complete")
}
catch (error) {
  // eslint-disable-next-line no-console
  console.error("Migration failed", error)
  process.exit(1)
}
finally {
  client.end()
}
