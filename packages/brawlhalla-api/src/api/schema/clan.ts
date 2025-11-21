import { z } from "zod/v4"

import { brawlhallaIdSchema, brawlhallaNameSchema } from "./brawlhalla-id"

const clanMemberRanks = ["Leader", "Officer", "Member", "Recruit"] as const

const MemberRank = z.enum(clanMemberRanks)

export type ClanMemberRank = z.infer<typeof MemberRank>

const Member = z.strictObject({
  brawlhalla_id: brawlhallaIdSchema,
  name: brawlhallaNameSchema,
  rank: MemberRank,
  join_date: z.number(),
  xp: z.number(),
})

export const clanSchema = z.strictObject({
  clan_id: brawlhallaIdSchema,
  clan_name: brawlhallaNameSchema,
  clan_create_date: z.number(),
  clan_xp: z.string(),
  clan: z.array(Member),
})

export type Clan = z.infer<typeof clanSchema>
