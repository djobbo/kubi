import { sql } from 'drizzle-orm';

import type { NewAlias } from '@/db/schema';
import { aliasesTable } from '@/db/schema';

import { supabase } from './client';
import { migrationDb } from './db';

const migrateAliases = async (offset: number, limit: number) => {
  console.time('Migrate aliases');
  const aliases = await supabase
    .from('BHPlayerAlias')
    .select('*')
    .range(offset, offset + limit - 1);

  if (aliases.status !== 200 || !!aliases.error) {
    console.error(aliases.error, { offset, limit });
    throw new Error('Failed to fetch aliases');
  }

  const migratedAliases: NewAlias[] = aliases.data?.map((alias) => {
    return {
      alias: alias.alias,
      createdAt: new Date(alias.createdAt),
      playerId: alias.playerId,
      public: alias.public,
    };
  });

  try {
    await migrationDb
      .insert(aliasesTable)
      .values(migratedAliases)
      .onConflictDoUpdate({
        set: {
          public: sql`excluded.public`,
        },
        target: [aliasesTable.playerId, aliasesTable.alias],
      })
      .execute();
  } catch (error) {
    console.error(error, { offset, limit });
    throw new Error('Failed to migrate aliases');
  }

  console.timeEnd('Migrate aliases');
  console.log('Migrated aliases', { offset, limit });
};

export const migrateAllAliases = async (maxAliases: number) => {
  console.time('Migrate all aliases');

  const { count } = await supabase
    .from('BHPlayerAlias')
    .select('*', { count: 'exact', head: true });

  console.log(`Migrating ${count} aliases`);

  for (let offset = 0; offset < (count ?? 0); offset += maxAliases) {
    await migrateAliases(offset, maxAliases);
  }

  console.timeEnd('Migrate all aliases');
};
