import { fixEncoding } from '@dair/common/src/helpers/fix-encoding';
import { aliasesTable, type NewAlias } from '@dair/schema/src/archive/aliases';
import { db } from '../db';
import { and, desc, eq, inArray, sql } from 'drizzle-orm';

const MIN_ALIAS_SEARCH_LENGTH = 3
const MAX_ALIASES_PER_PLAYER = 10

export const dedupeAndCleanAliases = (aliases: NewAlias[]) => {
    return aliases.reduce((acc, alias) => {
      let cleanAlias = fixEncoding(alias.alias.trim());
      console.log(cleanAlias)
  
      // Strip the •2 suffix from the alias (suffix added when 2 players play on the same machine)
      if (cleanAlias.endsWith('•2')) {
        cleanAlias = cleanAlias.slice(0, -2);
      }
  
      if (cleanAlias.length < 1) {
        return acc;
      }
  
      if (acc.some((existingAlias) => existingAlias.alias === cleanAlias)) {
        return acc;
      }
  
      acc.push(alias);
      return acc;
    }, [] as NewAlias[]);
}

export const aliasesService = {
  getAliases: async (playerId: string, page: number = 1, limit: number = 10) => {
    const aliases = await db
      .select()
      .from(aliasesTable)
      .orderBy(desc(aliasesTable.createdAt))
      .where(and(eq(aliasesTable.playerId, playerId), eq(aliasesTable.public, true)))
      .limit(limit)
      .offset((page - 1) * limit)
      .execute();

    return aliases;
  },
  updateAliases: async (aliases: NewAlias[]) => {
    const dedupedAliases = dedupeAndCleanAliases(aliases);

    console.log(dedupedAliases.map((alias) => alias.alias))
    
    const aliasesData = await db
    .insert(aliasesTable)
    .values(dedupedAliases)
    .returning()
    .onConflictDoUpdate({
      set: {
        public: sql`excluded.public`,
        updatedAt: new Date(),
      },
      target: [aliasesTable.playerId, aliasesTable.alias],
    })
    .execute();

    console.log(aliasesData)

    return aliasesData ?? aliases;
  },
  searchAliases: async (name: string, page: number = 1, limit: number = 10) => {
    if (name.length < MIN_ALIAS_SEARCH_LENGTH) {
      return [];
    }

    // Fetch aliases that start with the name
    const aliases = await db
      .select({
        playerId: aliasesTable.playerId,
      })
      .from(aliasesTable)
      .orderBy(desc(aliasesTable.createdAt))
      .where(and(eq(aliasesTable.public, true), sql`lower(${aliasesTable.alias}) like ${sql.placeholder('name')}`))
      .limit(limit)
      .offset((page - 1) * limit)
      .all({
        name: name?.toLowerCase() || ''
      });

      if (aliases.length === 0) {
        return [];
      }

    // Fetch other recent aliases for the corresponding players
    const allAliases = await db
      .select()
      .from(aliasesTable)
      .orderBy(desc(aliasesTable.createdAt))
      .where(
        inArray(
          aliasesTable.playerId,
          aliases.map((alias) => alias.playerId)
        )
      )
      .limit(MAX_ALIASES_PER_PLAYER)
      .groupBy(aliasesTable.playerId)
      .execute();

    console.log(allAliases)

    return allAliases;
  },
};