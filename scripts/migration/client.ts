import { createClient } from "@supabase/supabase-js"

import type { Database } from "./database.types"
import { SUPABASE_SERVICE_KEY, SUPABASE_URL } from "./env"

/**
 * Supabase client
 * In order to get the database.types.ts file
 * @see: https://supabase.com/docs/guides/api/rest/generating-types
 */
export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_SERVICE_KEY,
)
