import { PRE_MIGRATION_DISCORD_USER_ID_PREFIX } from "./constants"

export const getTempUserId = (discordId: string) =>
  `${PRE_MIGRATION_DISCORD_USER_ID_PREFIX}${discordId}`
