import { z } from "zod"

import { brawlhallaIdSchema } from "./brawlhalla-id"

const legendSchema = z.strictObject({
  legend_id: z.number(),
  legend_name_key: z.string(),
  damagedealt: z.string(),
  damagetaken: z.string(),
  kos: z.number(),
  falls: z.number(),
  suicides: z.number(),
  teamkos: z.number(),
  matchtime: z.number(),
  games: z.number(),
  wins: z.number(),
  damageunarmed: z.string(),
  damagethrownitem: z.string(),
  damageweaponone: z.string(),
  damageweapontwo: z.string(),
  damagegadgets: z.string(),
  kounarmed: z.number(),
  kothrownitem: z.number(),
  koweaponone: z.number(),
  koweapontwo: z.number(),
  kogadgets: z.number(),
  timeheldweaponone: z.number(),
  timeheldweapontwo: z.number(),
  xp: z.number(),
  level: z.number(),
  xp_percentage: z.number(),
})

const clanSchema = z.strictObject({
  clan_name: z.string(),
  clan_id: brawlhallaIdSchema,
  clan_xp: z.string(),
  personal_xp: z.number(),
})

export const playerStatsSchema = z.strictObject({
  brawlhalla_id: brawlhallaIdSchema,
  name: z.string(),
  xp: z.number(),
  level: z.number(),
  xp_percentage: z.number(),
  games: z.number(),
  wins: z.number(),
  damagebomb: z.string(),
  damagemine: z.string(),
  damagespikeball: z.string(),
  damagesidekick: z.string(),
  hitsnowball: z.number(),
  kobomb: z.number(),
  komine: z.number(),
  kospikeball: z.number(),
  kosidekick: z.number(),
  kosnowball: z.number(),
  legends: z.array(legendSchema),
  clan: clanSchema.optional(),
})

export type PlayerStats = z.infer<typeof playerStatsSchema>
