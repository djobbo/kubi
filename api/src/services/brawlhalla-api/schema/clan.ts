import { CleanString } from "@/helpers/clean-string"
import { NumberFromString } from "@/helpers/number-from-string"
import { Schema } from "effect"

const clanMemberRanks = ["Leader", "Officer", "Member", "Recruit"] as const
const MemberRank = Schema.Literal(...clanMemberRanks)

const Member = Schema.Struct({
  brawlhalla_id: NumberFromString,
  name: CleanString,
  rank: MemberRank,
  join_date: Schema.Number,
  xp: Schema.Number,
})

export const BrawlhallaApiClan = Schema.Struct({
  clan_id: NumberFromString,
  clan_name: CleanString,
  clan_create_date: Schema.Number,
  clan_xp: NumberFromString,
  clan_lifetime_xp: Schema.Number,
  clan: Schema.Array(Member),
})

export type BrawlhallaApiClan = Schema.Schema.Type<typeof BrawlhallaApiClan>
