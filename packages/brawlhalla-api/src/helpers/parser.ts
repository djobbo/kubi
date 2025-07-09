import { arrayToMap } from "@dair/common/src/helpers/arrayToMap"

import type { PlayerRanked } from "../api/schema/player-ranked"
import type { PlayerStats } from "../api/schema/player-stats"
// TODO: Dont use "legends" here, use "allLegends" instead
import { type Legend, legends } from "../constants/legends"
import { getLegendOrTeamRatingReset } from "./season-reset"

export type FullLegend = Legend & {
	stats?: PlayerStats["legends"][number]
	ranked?: PlayerRanked["legends"][number]
}

const weaponNameMap = {
	Pistol: "Blasters",
	RocketLance: "Rocket Lance",
	Katar: "Katars",
	Fists: "Gauntlets",
	Chakram: "Chakrams",
}

export const parsePlayerLegends = (
	stats: PlayerStats["legends"] | undefined,
	ranked: PlayerRanked["legends"] | undefined,
	allLegends:
		| {
				legend_id: number
				legend_name_key: string
				bio_name: string
				bio_aka: string
				weapon_one: string
				weapon_two: string
		  }[]
		| undefined,
) => {
	const statsMap = arrayToMap(stats ?? [], "legend_id")
	const rankedMap = arrayToMap(ranked ?? [], "legend_id")

	const parsedLegends = (allLegends ?? legends).map((legend) => {
		const stats = statsMap[legend.legend_id]
		const ranked = rankedMap[legend.legend_id]

		return {
			id: legend.legend_id,
			name: legend.bio_name,
			name_key: legend.legend_name_key,
			stats: {
				xp: stats?.xp ?? 0,
				level: stats?.level ?? 0,
				xp_percentage: stats?.level === 100 ? 100 : (stats?.xp_percentage ?? 0),
				damage_dealt: Number.parseInt(stats?.damagedealt ?? "0", 10),
				damage_taken: Number.parseInt(stats?.damagetaken ?? "0", 10),
				kos: stats?.kos ?? 0,
				falls: stats?.falls ?? 0,
				suicides: stats?.suicides ?? 0,
				team_kos: stats?.teamkos ?? 0,
				matchtime: stats?.matchtime ?? 0,
				games: stats?.games ?? 0,
				wins: stats?.wins ?? 0,
			},
			weapon_one: {
				name:
					weaponNameMap[legend.weapon_one as keyof typeof weaponNameMap] ??
					legend.weapon_one,
				damage_dealt: Number.parseInt(stats?.damageweaponone ?? "0", 10),
				kos: stats?.koweaponone ?? 0,
				time_held: stats?.timeheldweaponone ?? 0,
			},
			weapon_two: {
				name:
					weaponNameMap[legend.weapon_two as keyof typeof weaponNameMap] ??
					legend.weapon_two,
				damage_dealt: Number.parseInt(stats?.damageweapontwo ?? "0", 10),
				kos: stats?.koweapontwo ?? 0,
				time_held: stats?.timeheldweapontwo ?? 0,
			},
			unarmed: {
				damage_dealt: Number.parseInt(stats?.damageunarmed ?? "0", 10),
				kos: stats?.kounarmed ?? 0,
				time_held:
					(stats?.matchtime ?? 0) -
					(stats?.timeheldweaponone ?? 0) -
					(stats?.timeheldweapontwo ?? 0),
			},
			gadgets: {
				damage_dealt: Number.parseInt(stats?.damagegadgets ?? "0", 10),
				kos: stats?.kogadgets ?? 0,
			},
			weapon_throws: {
				damage_dealt: Number.parseInt(stats?.damagethrownitem ?? "0", 10),
				kos: stats?.kothrownitem ?? 0,
			},
			ranked: ranked
				? {
						rating: ranked.rating,
						peak_rating: ranked.peak_rating,
						tier: ranked.tier,
						wins: ranked.wins,
						games: ranked.games,
						rating_reset: getLegendOrTeamRatingReset(ranked.rating),
					}
				: null,
		}
	})

	return parsedLegends
}

export type ParsedLegend = ReturnType<typeof parsePlayerLegends>[number]

export const getLegendsAccumulativeData = (parsedLegends: ParsedLegend[]) => {
	return parsedLegends.reduce<{
		matchtime: number
		kos: number
		falls: number
		suicides: number
		team_kos: number
		damage_dealt: number
		damage_taken: number
	}>(
		(acc, legend) => {
			if (!legend.stats) return acc

			return {
				matchtime: acc.matchtime + legend.stats.matchtime,
				kos: acc.kos + legend.stats.kos,
				falls: acc.falls + legend.stats.falls,
				suicides: acc.suicides + legend.stats.suicides,
				team_kos: acc.team_kos + legend.stats.team_kos,
				damage_dealt: acc.damage_dealt + legend.stats.damage_dealt,
				damage_taken: acc.damage_taken + legend.stats.damage_taken,
			}
		},
		{
			matchtime: 0,
			kos: 0,
			falls: 0,
			suicides: 0,
			team_kos: 0,
			damage_dealt: 0,
			damage_taken: 0,
		},
	)
}

export interface FullWeapon {
	weapon: string
	legends: FullLegend[]
}

export const getWeaponsData = (legends: ParsedLegend[]) => {
	const weaponsMap = legends.reduce(
		(acc, legend) => {
			const { weapon_one, weapon_two, ...rest } = legend
			acc[weapon_one.name] ??= []
			acc[weapon_one.name]?.push({ weapon: weapon_one, ...rest })

			acc[weapon_two.name] ??= []
			acc[weapon_two.name]?.push({ weapon: weapon_two, ...rest })

			return acc
		},
		{} as Record<
			string,
			(Omit<ParsedLegend, "weapon_one" | "weapon_two"> & {
				weapon: ParsedLegend["weapon_one"]
			})[]
		>,
	)

	return Object.entries(weaponsMap).map(([weapon, legends]) => {
		const accumulativeData = legends.reduce(
			(acc, legend) => {
				return {
					games: acc.games + (legend.stats?.games ?? 0),
					wins: acc.wins + (legend.stats?.wins ?? 0),
					kos: acc.kos + (legend.weapon.kos ?? 0),
					damage_dealt: acc.damage_dealt + (legend.weapon.damage_dealt ?? 0),
					time_held: acc.time_held + (legend.weapon.time_held ?? 0),
					level: acc.level + (legend.stats?.level ?? 0),
					xp: acc.xp + (legend.stats?.xp ?? 0),
				}
			},
			{
				games: 0,
				wins: 0,
				kos: 0,
				damage_dealt: 0,
				time_held: 0,
				level: 0,
				xp: 0,
			},
		)

		return {
			name: weapon,
			stats: accumulativeData,
			legends: legends.map((legend) => {
				return {
					id: legend.id,
					name: legend.name,
					kos: legend.weapon.kos,
					damage_dealt: legend.weapon.damage_dealt,
					time_held: legend.weapon.time_held,
				}
			}),
		}
	})
}

export const getWeaponlessData = (legends: ParsedLegend[]) => {
	return legends.reduce(
		(acc, legend) => ({
			unarmed: {
				kos: acc.unarmed.kos + legend.unarmed.kos,
				damage_dealt: acc.unarmed.damage_dealt + legend.unarmed.damage_dealt,
				time_held: acc.unarmed.time_held + legend.unarmed.time_held,
			},
			gadgets: {
				kos: acc.gadgets.kos + legend.gadgets.kos,
				damage_dealt: acc.gadgets.damage_dealt + legend.gadgets.damage_dealt,
			},
			weapon_throws: {
				kos: acc.weapon_throws.kos + legend.weapon_throws.kos,
				damage_dealt:
					acc.weapon_throws.damage_dealt + legend.weapon_throws.damage_dealt,
			},
		}),
		{
			unarmed: {
				kos: 0,
				damage_dealt: 0,
				time_held: 0,
			},
			gadgets: {
				kos: 0,
				damage_dealt: 0,
			},
			weapon_throws: {
				kos: 0,
				damage_dealt: 0,
			},
		},
	)
}
