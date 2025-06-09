import { z } from "zod"

export const powerRankingsSchema = z.object({
  prPlayers: z.array(
    z.object({
      playerId: z.number(),
      playerName: z.string(),
      twitter: z.string().optional(),
      twitch: z.string().optional(),
      top8: z.number(),
      top32: z.number(),
      gold: z.number(),
      silver: z.number(),
      bronze: z.number(),
      powerRanking: z.number(),
      points: z.number(),
      earnings: z.number(),
    }),
  ),
  totalPages: z.number(),
  lastUpdated: z.string(),
})

export type PowerRankings = z.infer<typeof powerRankingsSchema>
