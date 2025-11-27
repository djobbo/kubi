import { clamp } from "@dair/common/src/helpers/math"

export const guildLevels = [0, 20_000, 200_000, 800_000, 2_000_000]

export const getGuildLevel = (guildXp: number) => {
  const level = guildLevels.findIndex((requiredXp) => requiredXp >= guildXp)
  const currentLevelRequiredXp = guildLevels[level - 1]
  const nextLevelRequiredXp = guildLevels[level]
  if (!currentLevelRequiredXp || !nextLevelRequiredXp) {
    return { level: guildLevels.length, xpPercentage: 100 }
  }

  const xpPercentage = clamp(
    (guildXp - currentLevelRequiredXp) /
      (nextLevelRequiredXp - currentLevelRequiredXp),
    0,
    1,
  )
  return { level, xpPercentage }
}
