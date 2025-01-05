import { migrateAllAliases } from "./aliases"
import { migrateAllBookmarks } from "./bookmarks"

const MAX_ALIASES_PER_ITERATION = 1000
const MAX_BOOKMARKS_PER_ITERATION = 1000

console.time("Migration")

await migrateAllAliases(MAX_ALIASES_PER_ITERATION)
await migrateAllBookmarks(MAX_BOOKMARKS_PER_ITERATION)

console.timeEnd("Migration")

process.exit(0)
