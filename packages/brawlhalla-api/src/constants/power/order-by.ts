import { z } from "zod/v4"

export enum PowerRankingsOrderBy {
	Top8Count = "top8",
	Top32Count = "top32",
	GoldMedals = "gold",
	SilverMedals = "silver",
	BronzeMedals = "bronze",
	PowerRank = "powerRanking",
	Points = "points",
	Earnings = "earnings",
}

export const powerRankedOrderBy = [
	PowerRankingsOrderBy.Top8Count,
	PowerRankingsOrderBy.Top32Count,
	PowerRankingsOrderBy.GoldMedals,
	PowerRankingsOrderBy.SilverMedals,
	PowerRankingsOrderBy.BronzeMedals,
	PowerRankingsOrderBy.PowerRank,
	PowerRankingsOrderBy.Points,
	PowerRankingsOrderBy.Earnings,
] as const

export const powerRankedOrderBySchema = z
	.enum(powerRankedOrderBy)
	.default(PowerRankingsOrderBy.PowerRank)
	.catch(PowerRankingsOrderBy.PowerRank)

export type PowerRankedOrderBy = z.infer<typeof powerRankedOrderBySchema>

export enum PowerRankingsOrder {
	Asc = "ASC",
	Desc = "DESC",
}

export const powerRankedOrder = [
	PowerRankingsOrder.Asc,
	PowerRankingsOrder.Desc,
] as const

export const powerRankedOrderSchema = z
	.enum(powerRankedOrder)
	.default(PowerRankingsOrder.Asc)
	.catch(PowerRankingsOrder.Asc)

export type PowerRankedOrder = z.infer<typeof powerRankedOrderSchema>
