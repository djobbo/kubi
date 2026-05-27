import { createHash } from "node:crypto"

/** Prefix for placeholder user rows created before OAuth accounts are linked. */
export const PRE_MIGRATION_DISCORD_USER_ID_PREFIX = "pre-migration-discord:"

/** Deterministic UUID for a Discord account pending full user migration. */
export const placeholderUserIdFromDiscord = (
  discordProviderId: string,
): string => {
  const digest = createHash("sha256")
    .update(`${PRE_MIGRATION_DISCORD_USER_ID_PREFIX}${discordProviderId}`)
    .digest("hex")

  return [
    digest.slice(0, 8),
    digest.slice(8, 12),
    `4${digest.slice(13, 16)}`,
    `8${digest.slice(17, 20)}`,
    digest.slice(20, 32),
  ].join("-")
}
