import "dotenv/config"

const required = (name: string): string => {
  const value = process.env[name]
  if (!value) {
    throw new Error(
      `Missing ${name}. Set it in the repo root .env (see .env.example).`,
    )
  }
  return value
}

/** Supabase project URL (migration source). */
export const MIGRATION_SUPABASE_URL = required("MIGRATION_SUPABASE_URL")

/** Supabase service role key (migration source). */
export const MIGRATION_SUPABASE_SERVICE_KEY = required(
  "MIGRATION_SUPABASE_SERVICE_KEY",
)

/**
 * Direct Postgres URL for the legacy Supabase database (raw SQL in bookmarks).
 * Falls back to DATABASE_URL when not set.
 */
export const MIGRATION_SUPABASE_DATABASE_URL =
  process.env.MIGRATION_SUPABASE_DATABASE_URL ??
  process.env.DATABASE_URL ??
  required("MIGRATION_SUPABASE_DATABASE_URL")

/** Target kubi Postgres (Drizzle). */
export const MIGRATION_DATABASE_URL =
  process.env.MIGRATION_DATABASE_URL ??
  process.env.DATABASE_URL ??
  required("DATABASE_URL")
