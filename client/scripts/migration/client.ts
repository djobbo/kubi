import { createClient } from '@supabase/supabase-js';

import type { Database } from './database.types';
import { MIGRATION_SUPABASE_SERVICE_KEY, MIGRATION_SUPABASE_URL } from './env';

/**
 * Supabase client
 * In order to get the database.types.ts file
 * @see: https://supabase.com/docs/guides/api/rest/generating-types
 */
export const supabase = createClient<Database>(
  MIGRATION_SUPABASE_URL,
  MIGRATION_SUPABASE_SERVICE_KEY
);
