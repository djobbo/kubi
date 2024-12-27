import { z } from "zod"

import { brawlhallaIdSchema } from "./brawlhalla-id"

// eslint-disable-next-line lingui/no-unlocalized-strings
const clanMemberRanks = ["Leader", "Officer", "Member", "Recruit"] as const

const MemberRank = z.enum(clanMemberRanks)

export type ClanMemberRank = z.infer<typeof MemberRank>

const Member = z.strictObject({
  brawlhalla_id: brawlhallaIdSchema,
  name: z.string(),
  rank: MemberRank,
  join_date: z.number(),
  xp: z.number(),
})

export const clanSchema = z.strictObject({
  clan_id: brawlhallaIdSchema,
  clan_name: z.string(),
  clan_create_date: z.number(),
  clan_xp: z.string(),
  clan: z.array(Member),
})

export type Clan = z.infer<typeof clanSchema>
