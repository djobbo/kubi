import { legends } from "../constants/legends.js"
import type { RankedRegion } from "../constants/ranked/regions.js"
import type { Clan } from "../schema/clan.js"
import type { Legend } from "../schema/legends.js"
import type { PlayerRanked } from "../schema/player-ranked.js"
import type { PlayerStats } from "../schema/player-stats.js"
import type {
  Ranking1v1,
  Ranking2v2,
  RankingRotating,
} from "../schema/rankings.js"
import type { SearchBySteamId } from "../schema/search.js"

const PAGE_SIZE = 20

const zeroStats = {
  damagedealt: "0",
  damagetaken: "0",
  kos: 0,
  falls: 0,
  suicides: 0,
  teamkos: 0,
  matchtime: 0,
  games: 0,
  wins: 0,
  damageunarmed: "0",
  damagethrownitem: "0",
  damageweaponone: "0",
  damageweapontwo: "0",
  damagegadgets: "0",
  kounarmed: 0,
  kothrownitem: 0,
  koweaponone: 0,
  koweapontwo: 0,
  kogadgets: 0,
  timeheldweaponone: 0,
  timeheldweapontwo: 0,
  xp: 0,
  level: 1,
  xp_percentage: 0,
}

const mockLegendStats = legends.slice(0, 3).map((legend) => ({
  legend_id: legend.legend_id,
  legend_name_key: legend.legend_name_key,
  ...zeroStats,
  games: 100,
  wins: 50,
  xp: 5000,
  level: 25,
  xp_percentage: 0.5,
}))

export const mockPlayerStats = (playerId: number): PlayerStats => ({
  brawlhalla_id: playerId,
  name: `MockPlayer${playerId}`,
  xp: 12_345,
  level: 52,
  xp_percentage: 0.42,
  games: 800,
  wins: 420,
  damagebomb: "1000",
  damagemine: "500",
  damagespikeball: "250",
  damagesidekick: "100",
  hitsnowball: 10,
  kobomb: 5,
  komine: 3,
  kospikeball: 2,
  kosidekick: 1,
  kosnowball: 1,
  legends: mockLegendStats,
})

export const mockPlayerRanked = (playerId: number): PlayerRanked => ({
  name: `MockPlayer${playerId}`,
  brawlhalla_id: playerId,
  global_rank: 100,
  region_rank: 10,
  rating: 1800,
  peak_rating: 1900,
  tier: "Platinum 3",
  wins: 120,
  games: 200,
  region: "eu",
  legends: mockLegendStats.map((legend) => ({
    legend_id: legend.legend_id,
    legend_name_key: legend.legend_name_key,
    rating: 1700,
    peak_rating: 1750,
    tier: "Gold 1",
    wins: 40,
    games: 70,
  })),
  "2v2": [
    {
      brawlhalla_id_one: playerId,
      brawlhalla_id_two: playerId + 1,
      rating: 1600,
      peak_rating: 1650,
      tier: "Gold 2",
      wins: 30,
      games: 50,
      teamname: `Team${playerId}`,
      region: 2,
      global_rank: 500,
    },
  ],
  rotating_ranked: null,
})

const rankingBase = (rank: number, region: RankedRegion) => ({
  rank,
  rating: 2200 - rank * 5,
  tier: rank <= 10 ? ("Diamond" as const) : ("Platinum 1" as const),
  games: 300,
  wins: 180,
  region,
  peak_rating: 2250 - rank * 5,
})

export const mockRankings1v1 = (
  region: RankedRegion,
  page: number,
  name?: string,
): ReadonlyArray<Ranking1v1> => {
  const entries = Array.from({ length: PAGE_SIZE }, (_, index) => {
    const rank = (page - 1) * PAGE_SIZE + index + 1
    const playerId = rank * 100 + page

    return {
      ...rankingBase(rank, region),
      name: `MockPlayer${playerId}`,
      brawlhalla_id: playerId,
      best_legend: legends[0]!.legend_id,
      best_legend_games: 80,
      best_legend_wins: 45,
    }
  })

  if (name === undefined) {
    return entries
  }

  const needle = name.toLowerCase()
  return entries.filter((entry) => entry.name.toLowerCase().includes(needle))
}

export const mockRankings2v2 = (
  region: RankedRegion,
  page: number,
): ReadonlyArray<Ranking2v2> =>
  Array.from({ length: PAGE_SIZE }, (_, index) => {
    const rank = (page - 1) * PAGE_SIZE + index + 1
    const playerIdOne = rank * 100 + page
    const playerIdTwo = playerIdOne + 1

    return {
      ...rankingBase(rank, region),
      teamname: `Team${playerIdOne}`,
      brawlhalla_id_one: playerIdOne,
      brawlhalla_id_two: playerIdTwo,
    }
  })

export const mockRankingsRotating = (
  region: RankedRegion,
  page: number,
): ReadonlyArray<RankingRotating> =>
  Array.from({ length: PAGE_SIZE }, (_, index) => {
    const rank = (page - 1) * PAGE_SIZE + index + 1
    const playerId = rank * 100 + page

    return {
      ...rankingBase(rank, region),
      name: `MockPlayer${playerId}`,
      brawlhalla_id: playerId,
    }
  })

export const mockClan = (clanId: number): Clan => ({
  clan_id: clanId,
  clan_name: `MockClan${clanId}`,
  clan_create_date: 1_600_000_000,
  clan_xp: "50000",
  clan_lifetime_xp: 100_000,
  clan: [
    {
      brawlhalla_id: 1001,
      name: "MockLeader",
      rank: "Leader",
      join_date: 1_600_000_000,
      xp: 10_000,
    },
    {
      brawlhalla_id: 1002,
      name: "MockMember",
      rank: "Member",
      join_date: 1_610_000_000,
      xp: 5000,
    },
  ],
})

export const mockLegends: ReadonlyArray<Legend> = legends

export const mockLegend = (legendId: number): Legend => {
  const legend = legends.find((entry) => entry.legend_id === legendId)
  if (!legend) {
    return legends[0]!
  }

  return legend
}

export const mockSearchBySteamId = (steamId: string): SearchBySteamId => ({
  brawlhalla_id: 12345,
  name: `SteamPlayer-${steamId.slice(-4)}`,
})
