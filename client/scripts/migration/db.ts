import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import * as schema from '@/db/schema';

import { MIGRATION_DATABASE_URL } from './env';

const queryClient = postgres(MIGRATION_DATABASE_URL);

export const migrationDb = drizzle(queryClient, { schema });
