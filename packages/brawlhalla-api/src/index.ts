export { BrawlhallaApi, BRAWLHALLA_API_BASE_URL } from "./api/definition.js"
export { BrawlhallaApiConfig } from "./api/config.js"
export {
  BrawlhallaApiClientService,
  layerBrawlhallaApiClient,
  makeBrawlhallaApiClient,
  type BrawlhallaApiClient,
} from "./api/client.js"
export { ApiKeyMiddleware } from "./api/middleware.js"

export {
  rankedBrackets,
  RankedBracketSchema,
  type RankedBracket,
} from "./constants/brackets.js"
export {
  clanRanks,
  ClanRankSchema,
  type ClanRank,
} from "./constants/clan-ranks.js"
export {
  rankedRegions,
  RankedRegionSchema,
  RankedRegionParamSchema,
  isRankedRegion,
  type RankedRegion,
} from "./constants/ranked/regions.js"
export {
  rankedTiers,
  RankedTierSchema,
  getTierFromRating,
  isRankedTier,
  type RankedTier,
} from "./constants/ranked/tiers.js"
export { weapons, type Weapon } from "./constants/weapons.js"
export { legends, legendsMap } from "./constants/legends.js"
export { guildLevels, getGuildLevel } from "./constants/guilds.js"
export { MAX_SHOWN_ALIASES } from "./constants/aliases.js"

export * from "./helpers/parser.js"
export * from "./helpers/season-reset.js"
export * from "./helpers/team-players.js"
export * from "./helpers/playerAliases.js"
export * from "./helpers/winrate.js"

export * from "./schema/brawlhalla-id.js"
export * from "./schema/clan.js"
export * from "./schema/legends.js"
export * from "./schema/player-ranked.js"
export * from "./schema/player-stats.js"
export * from "./schema/rankings.js"
export * from "./schema/region.js"
export * from "./schema/search.js"
export * from "./schema/tier.js"

/** @deprecated Use {@link PlayerStats} */
export { PlayerStats as BrawlhallaApiPlayerStats } from "./schema/player-stats.js"
/** @deprecated Use {@link PlayerRanked} */
export { PlayerRanked as BrawlhallaApiPlayerRanked } from "./schema/player-ranked.js"
/** @deprecated Use {@link Clan} */
export { Clan as BrawlhallaApiClan } from "./schema/clan.js"
/** @deprecated Use {@link Legends} */
export { Legends as BrawlhallaApiLegends } from "./schema/legends.js"
/** @deprecated Use {@link Rankings1v1} */
export { Rankings1v1 as BrawlhallaApiRankings1v1 } from "./schema/rankings.js"
/** @deprecated Use {@link Rankings2v2} */
export { Rankings2v2 as BrawlhallaApiRankings2v2 } from "./schema/rankings.js"
/** @deprecated Use {@link RankingsRotating} */
export { RankingsRotating as BrawlhallaApiRankingsRotating } from "./schema/rankings.js"
