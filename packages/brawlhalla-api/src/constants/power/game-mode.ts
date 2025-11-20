import { z } from "zod/v4"

export enum PowerRankingsGameMode {
  Power1v1 = "1v1",
  Power2v2 = "2v2",
}

export const powerRankedGameModeMap = {
  [PowerRankingsGameMode.Power1v1]: 1,
  [PowerRankingsGameMode.Power2v2]: 2,
} as const

export const powerRankedGameMode = [
  PowerRankingsGameMode.Power1v1,
  PowerRankingsGameMode.Power2v2,
] as const

export const powerRankedGameModeSchema = z
  .enum(powerRankedGameMode)
  .default(PowerRankingsGameMode.Power1v1)
  .catch(PowerRankingsGameMode.Power1v1)

export type PowerRankedGameMode = z.infer<typeof powerRankedGameModeSchema>
