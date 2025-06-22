import { FlagIcon } from "@/features/brawlhalla/components/Image"
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/components/card"
import { rankedRegions } from "@dair/brawlhalla-api/src/constants/ranked/regions"
import { getTierFromRating } from "@dair/brawlhalla-api/src/constants/ranked/tiers"
import { getLegendEloReset } from "@dair/brawlhalla-api/src/helpers/season-reset"
import { getTeamPlayers } from "@dair/brawlhalla-api/src/helpers/team-players"
import { calculateWinrate } from "@dair/brawlhalla-api/src/helpers/winrate"
import { t } from "@lingui/core/macro"
import { createFileRoute } from "@tanstack/react-router"
import { Route as PlayerRoute } from "./$playerId"
import { RankedDisplay } from "./-ranked-display"
import { StatsGrid } from "./-stats-grid"

export const Route = createFileRoute("/players/$playerId/2v2")({
	component: RouteComponent,
})

function RouteComponent() {
	const {
		data: { ranked },
	} = PlayerRoute.useLoaderData()
	const teams = ranked["2v2"]
	const teamCount = teams.length

	// TODO: API level
	const { totalWins, totalGames, totalRating, totalPeakRating } = ranked[
		"2v2"
	].reduce(
		({ totalWins, totalGames, totalRating, totalPeakRating }, team) => ({
			totalWins: totalWins + team.wins,
			totalGames: totalGames + team.games,
			totalRating: totalRating + team.rating,
			totalPeakRating: totalPeakRating + team.peak_rating,
		}),
		{
			totalWins: 0,
			totalGames: 0,
			totalRating: 0,
			totalPeakRating: 0,
		},
	)

	return (
		<>
			<StatsGrid
				stats={[
					{
						name: t`Total games`,
						value: totalGames,
						desc: t`Total games played this season`,
					},
					{
						name: t`Total wins`,
						value: totalWins,
						desc: t`Total games won this season`,
					},
					{
						name: t`Total losses`,
						value: totalGames - totalWins,
						desc: t`Total games lost this season`,
					},
					{
						name: t`Winrate`,
						value: t`${calculateWinrate(totalWins, totalGames).toFixed(2)}%`,
						desc: t`Winrate (total wins / total games)`,
					},
					{
						name: t`Teammates`,
						value: teamCount,
						desc: t`Number of teammates this season`,
					},
					{
						name: t`Avg. games per teammate`,
						value: (totalGames / teamCount).toFixed(2),
						desc: t`Average games played per teammate`,
					},
					{
						name: t`Avg. wins per teammate`,
						value: (totalWins / teamCount).toFixed(2),
						desc: t`Average games won per teammate`,
					},
					{
						name: t`Avg. losses per teammate`,
						value: ((totalGames - totalWins) / teamCount).toFixed(2),
						desc: t`Average games lost per teammate`,
					},
					{
						name: t`Avg. team rating`,
						value: (totalRating / teamCount).toFixed(0),
						desc: t`Average team Elo rating`,
					},
					{
						name: t`Avg. team peak rating`,
						value: (totalPeakRating / teamCount).toFixed(0),
						desc: t`Average team peak Elo rating`,
					},
				]}
			/>
			<div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
				{teams.map((team) => {
					// TODO: API level
					const players = getTeamPlayers(team)
					if (!players) return null
					const region = rankedRegions[team.region - 1] ?? "all"

					const currentPlayer = players.find(
						(player) => player.id === ranked.brawlhalla_id,
					)
					const otherPlayer = players.find(
						(player) => player.id !== ranked.brawlhalla_id,
					)
					if (!currentPlayer || !otherPlayer) return null

					const eloReset = getLegendEloReset(team.rating)
					const eloResetTier = getTierFromRating(eloReset)

					return (
						<Card key={team.id}>
							<CardHeader>
								<CardTitle className="flex justify-between text-lg font-bold">
									<div>
										<p className="flex items-center gap-1">
											{otherPlayer.name}
										</p>
										<p className="text-muted-foreground text-sm">
											& {currentPlayer.name}
										</p>
									</div>
									<FlagIcon region={region} className="w-8 h-8 rounded-sm" />
								</CardTitle>
							</CardHeader>
							<CardContent className="flex flex-col gap-4">
								<RankedDisplay
									tier={team.tier}
									rating={team.rating}
									peak_rating={team.peak_rating}
									wins={team.wins}
									games={team.games}
								/>

								<StatsGrid
									stats={[
										{
											name: t`Games`,
											value: team.games,
											desc: t`Games played this season`,
										},
										{
											name: t`Winrate`,
											value: `${calculateWinrate(team.wins, team.games).toFixed(2)}%`,
											desc: t`Winrate this season (wins / games)`,
										},
										{
											name: t`Elo reset`,
											value: eloReset,
											desc: t`Elo reset for next season (${eloResetTier})`,
										},
										// center grid elements
									]}
									gridOverride="grid-cols-3"
								/>
							</CardContent>
						</Card>
					)
				})}
			</div>
		</>
	)
}
