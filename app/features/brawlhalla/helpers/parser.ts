import { arrayToMap } from "@/helpers/arrayToMap"

import type { PlayerRanked } from "../api/schema/player-ranked"
import type { PlayerStats } from "../api/schema/player-stats"
import { type Legend, legends, legendsMap } from "../constants/legends"
import type { Weapon } from "../constants/weapons"

export type FullLegend = Legend & {
  stats?: PlayerStats["legends"][number]
  ranked?: PlayerRanked["legends"][number]
}

export const getFullLegends = (
  stats: PlayerStats["legends"],
  ranked?: PlayerRanked["legends"],
  keepUnusedLegends = true,
) => {
  const statsMap = arrayToMap(stats ?? [], "legend_id")
  const rankedMap = arrayToMap(ranked ?? [], "legend_id")

  const fullLegends = legends.reduce<Record<number, FullLegend>>(
    (acc, legend) => (
      (acc[legend.legend_id] = {
        ...legend,
        stats: statsMap[legend.legend_id],
        ranked: rankedMap[legend.legend_id],
      }),
      acc
    ),
    {},
  )

  return keepUnusedLegends
    ? Object.values(fullLegends)
    : Object.values(fullLegends).filter((legend) => legend.stats?.games)
}

export const getLegendsAccumulativeData = (fullLegends: FullLegend[]) => {
  return fullLegends.reduce<{
    matchtime: number
    kos: number
    falls: number
    suicides: number
    teamkos: number
    damagedealt: number
    damagetaken: number
  }>(
    (acc, legend) => {
      if (!legend.stats) return acc

      return {
        matchtime: acc.matchtime + legend.stats.matchtime,
        kos: acc.kos + legend.stats.kos,
        falls: acc.falls + legend.stats.falls,
        suicides: acc.suicides + legend.stats.suicides,
        teamkos: acc.teamkos + legend.stats.teamkos,
        damagedealt: acc.damagedealt + parseInt(legend.stats.damagedealt),
        damagetaken: acc.damagetaken + parseInt(legend.stats.damagetaken),
      }
    },
    {
      matchtime: 0,
      kos: 0,
      falls: 0,
      suicides: 0,
      teamkos: 0,
      damagedealt: 0,
      damagetaken: 0,
    },
  )
}

export interface FullWeapon {
  weapon: string
  legends: FullLegend[]
}

export const getFullWeapons = (legends: FullLegend[]): FullWeapon[] => {
  const weaponsMap = legends.reduce(
    (acc, legend) => {
      const legendData = legendsMap[legend.legend_id]

      acc[legendData.weapon_one] ??= []
      acc[legendData.weapon_one].push(legend)

      acc[legendData.weapon_two] ??= []
      acc[legendData.weapon_two].push(legend)

      return acc
    },
    {} as Record<Weapon, FullLegend[]>,
  )

  const weapons = Object.entries(weaponsMap).map(([weapon, legends]) => ({
    weapon,
    legends,
  }))

  return weapons
}

export const getWeaponlessData = (legends: FullLegend[]) => {
  return legends.reduce(
    (acc, legend) => ({
      unarmed: {
        kos: acc.unarmed.kos + (legend.stats?.kounarmed ?? 0),
        damageDealt:
          acc.unarmed.damageDealt +
          parseInt(legend.stats?.damageunarmed ?? "0"),
        matchtime:
          acc.unarmed.matchtime +
          (legend.stats
            ? legend.stats.matchtime -
              legend.stats.timeheldweaponone -
              legend.stats.timeheldweapontwo
            : 0),
      },
      gadgets: {
        kos: acc.gadgets.kos + (legend.stats?.kogadgets ?? 0),
        damageDealt:
          acc.gadgets.damageDealt +
          parseInt(legend.stats?.damagegadgets ?? "0"),
      },
      throws: {
        kos: acc.throws.kos + (legend.stats?.kothrownitem ?? 0),
        damageDealt:
          acc.throws.damageDealt +
          parseInt(legend.stats?.damagethrownitem ?? "0"),
      },
    }),
    {
      unarmed: {
        kos: 0,
        damageDealt: 0,
        matchtime: 0,
      },
      gadgets: {
        kos: 0,
        damageDealt: 0,
      },
      throws: {
        kos: 0,
        damageDealt: 0,
      },
    },
  )
}

export const getWeaponsAccumulativeData = (weapons: FullWeapon[]) => {
  return weapons.map((weapon) => {
    const data = weapon.legends.reduce(
      (acc, legend) => {
        const isWeaponOne = legend.weapon_one === weapon.weapon
        return {
          games: acc.games + (legend.stats?.games ?? 0),
          wins: acc.wins + (legend.stats?.wins ?? 0),
          kos:
            acc.kos +
            ((isWeaponOne
              ? legend.stats?.koweaponone
              : legend.stats?.koweapontwo) ?? 0),
          damageDealt:
            acc.damageDealt +
            parseInt(
              (isWeaponOne
                ? legend.stats?.damageweapontwo
                : legend.stats?.damageweapontwo) ?? "0",
            ),
          matchtime:
            acc.matchtime +
            ((isWeaponOne
              ? legend.stats?.timeheldweaponone
              : legend.stats?.timeheldweapontwo) ?? 0),
          level: acc.level + (legend.stats?.level ?? 0),
          xp: acc.xp + (legend.stats?.xp ?? 0),
        }
      },
      {
        games: 0,
        wins: 0,
        kos: 0,
        damageDealt: 0,
        matchtime: 0,
        level: 0,
        xp: 0,
      },
    )
    return {
      ...weapon,
      ...data,
    }
  })
}
