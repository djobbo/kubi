export const guildLevels = [0, 20_000, 200_000, 800_000, 2_000_000]

export const getGuildLevel = (xp: number) => {
  const level = guildLevels.findIndex((level) => xp >= level) + 1
  const levelXp = guildLevels[level]
  if (!levelXp) {
    return { level: guildLevels.length, xpPercentage: 100 }
  }

  const xpPercentage = Math.min(100, ((xp - levelXp) / levelXp) * 100)
  return { level, xpPercentage }
}
