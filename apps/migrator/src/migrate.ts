import "dotenv/config"

import { migrateAllAliases } from "./aliases"
import { migrateAllBookmarks } from "./bookmarks"

// Migrate and transform data from the old Supabase DB into on-prem Postgres.

const MAX_ALIASES_PER_ITERATION = 1000
const MAX_BOOKMARKS_PER_ITERATION = 1000

const main = async () => {
  console.time("Migration")

  await migrateAllAliases(MAX_ALIASES_PER_ITERATION)
  await migrateAllBookmarks(MAX_BOOKMARKS_PER_ITERATION)

  console.timeEnd("Migration")
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
