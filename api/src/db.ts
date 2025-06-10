import { drizzle } from 'drizzle-orm/bun-sqlite';
import { Database } from 'bun:sqlite';

import * as schema from '@dair/schema';
import { env } from './env';

const sqlite = new Database(env.DATABASE_URL, { create: true });

export const db = drizzle(sqlite, { schema });
