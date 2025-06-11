import { cleanString } from "@dair/common/src/helpers/clean-string"
import { type NewArchivedClan, clansTable } from "@dair/schema"
import { type NewAlias, aliasesTable } from "@dair/schema/src/archive/aliases"
import { and, count, desc, eq, inArray, like, sql } from "drizzle-orm"
import { db } from "../db"
import { brawlhallaService } from "./brawlhalla"

const MIN_ALIAS_SEARCH_LENGTH = 3
const MAX_ALIASES_PER_PLAYER = 10
export const CLANS_RANKINGS_PER_PAGE = 50

export const dedupeAndCleanAliases = (aliases: NewAlias[]) => {
	const dedupedAliases = aliases.reduce((acc, alias) => {
		let cleanAlias = cleanString(alias.alias.trim())

		// Strip the •2 suffix from the alias (suffix added when 2 players play on the same machine)
		if (cleanAlias.endsWith("•2")) {
			cleanAlias = cleanAlias.slice(0, -2)
		}

		if (cleanAlias.length < 1) {
			return acc
		}

		if (
			acc.some(
				(existingAlias) =>
					existingAlias.alias === cleanAlias &&
					existingAlias.playerId === alias.playerId,
			)
		) {
			return acc
		}

		acc.push({
			...alias,
			alias: cleanAlias,
		})
		return acc
	}, [] as NewAlias[])

	return dedupedAliases
}

export const archiveService = {
	getAliases: async (playerId: string, page = 1, limit = 10) => {
		const aliases = await db
			.select()
			.from(aliasesTable)
			.orderBy(desc(aliasesTable.createdAt))
			.where(
				and(eq(aliasesTable.playerId, playerId), eq(aliasesTable.public, true)),
			)
			.limit(limit)
			.offset((page - 1) * limit)
			.execute()

		return aliases
	},
	updateAliases: async (aliases: NewAlias[]) => {
		const dedupedAliases = dedupeAndCleanAliases(aliases)

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
			.execute()

		return aliasesData ?? aliases
	},
	searchAliases: async (name?: string, page = 1, limit = 10) => {
		if (!name || name.length < MIN_ALIAS_SEARCH_LENGTH) {
			return []
		}

		// Fetch aliases that start with the name
		const aliases = db
			.select({
				playerId: aliasesTable.playerId,
			})
			.from(aliasesTable)
			.orderBy(desc(aliasesTable.createdAt))
			// ilike is not supported by drizzle sqlite
			.where(like(sql`lower(${aliasesTable.alias})`, `${name.toLowerCase()}%`))
			.limit(limit)
			.offset((page - 1) * limit)
			.all({
				name: name?.toLowerCase() || "",
			})

		if (aliases.length === 0) {
			return []
		}

		// Fetch other recent aliases for the corresponding players
		const allAliases = await db
			.select({
				playerId: aliasesTable.playerId,
				alias: aliasesTable.alias,
				updatedAt: aliasesTable.updatedAt,
			})
			.from(aliasesTable)
			.orderBy(desc(aliasesTable.createdAt))
			.where(
				inArray(
					aliasesTable.playerId,
					aliases.map((alias) => alias.playerId),
				),
			)
			.limit(MAX_ALIASES_PER_PLAYER)
			.execute()

		const aggregatedAliases = allAliases.reduce(
			(acc, alias) => {
				const existingAlias = acc[alias.playerId]
				const newAlias = { alias: alias.alias, updatedAt: alias.updatedAt }

				if (!existingAlias) {
					acc[alias.playerId] = {
						aliases: [newAlias],
						playerId: alias.playerId,
					}
					return acc
				}

				existingAlias.aliases.push(newAlias)
				acc[alias.playerId] = existingAlias
				return acc
			},
			{} as Record<
				string,
				{ aliases: { alias: string; updatedAt: Date }[]; playerId: string }
			>,
		)

		const playerRankedCached =
			await brawlhallaService.getPlayerRankedByIdCached(
				Object.keys(aggregatedAliases),
			)

		return Object.values(aggregatedAliases).map((alias) => {
			const ranked = playerRankedCached.find(
				(playerRanked) =>
					playerRanked.brawlhalla_id.toString() === alias.playerId,
			)

			return {
				playerId: alias.playerId,
				aliases: alias.aliases.sort(
					(a, b) => b.updatedAt.getTime() - a.updatedAt.getTime(),
				),
				ranked: ranked
					? {
							rank: ranked.region,
							games: ranked.games,
							wins: ranked.wins,
							rating: ranked.rating,
							peak_rating: ranked.peak_rating,
						}
					: null,
			}
		})
	},
	updateClans: async (clans: NewArchivedClan[]) => {
		const clansData = await db
			.insert(clansTable)
			.values(
				clans.map((clan) => ({
					...clan,
					name: cleanString(clan.name.trim()),
					createdAt: clan.createdAt ?? null,
				})),
			)
			.returning()
			.onConflictDoUpdate({
				set: {
					createdAt: sql`CASE WHEN excluded."createdAt" IS NOT NULL THEN excluded."createdAt" ELSE ${clansTable.createdAt} END`,
					xp: sql`excluded.xp`,
					name: sql`excluded.name`,
					updatedAt: new Date(),
				},
				target: [clansTable.id],
			})
			.execute()

		return clansData
	},
	getClans: async ({
		page = 1,
		limit = CLANS_RANKINGS_PER_PAGE,
		name,
	}: { page?: number; limit?: number; name?: string }) => {
		const clansTransaction = db.transaction(async (tx) => {
		const total = await tx
			.select({ count: count() })
			.from(clansTable)
			.where(
				name
					? like(sql`lower(${clansTable.name})`, `${name.toLowerCase()}%`)
					: undefined,
			)
			.execute()

		const clans = await tx
			.select()
			.from(clansTable)
			.orderBy(desc(clansTable.xp))
			.limit(limit)
			.offset((page - 1) * limit)
			.where(
				name
					? like(sql`lower(${clansTable.name})`, `${name.toLowerCase()}%`)
					: undefined,
			)
				.execute()

			return {
				search: name,
				clans,
				total: total[0]?.count ?? null,
				perPage: limit,
				page,
			}
		})

		return clansTransaction
	},
}
