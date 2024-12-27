export type BrawlhallaID = string | number

const RankedTiers = {
  Vallhallan: 9999,
  Diamond: 2000,
  Platinum5: 1936,
  Platinum4: 1872,
  Platinum3: 1808,
  Platinum2: 1744,
  Platinum1: 1680,
  Gold5: 1622,
  Gold4: 1564,
  Gold3: 1506,
  Gold2: 1448,
  Gold1: 1390,
  Silver5: 1338,
  Silver4: 1286,
  Silver3: 1234,
  Silver2: 1182,
  Silver1: 1130,
  Bronze5: 1086,
  Bronze4: 1042,
  Bronze3: 998,
  Bronze2: 954,
  Bronze1: 910,
  Tin5: 872,
  Tin4: 834,
  Tin3: 796,
  Tin2: 758,
  Tin1: 720,
  Tin0: 200,
} as const

export type RankedTier = keyof typeof RankedTiers

export const getTierFromRating = (rating: number): RankedTier => {
  for (const [tier, value] of Object.entries(RankedTiers)) {
    if (rating >= value) {
      return tier as RankedTier
    }
  }

  return "Tin0"
}
