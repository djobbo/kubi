import { FlagIcon } from "@/features/brawlhalla/components/Image"
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/ui/components/card"
import { getTierFromRating } from "@dair/brawlhalla-api/src/constants/ranked/tiers"
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
		data: { name: playerName, ranked },
	} = PlayerRoute.useLoaderData()
	if (!ranked) return null

	const ranked2v2 = ranked["2v2"]
	if (!ranked2v2) return null

	const teamCount = ranked2v2.teams.length

	return (
		<>
			<StatsGrid
				stats={[
					{
						name: t`Total games`,
						value: ranked2v2.games,
						desc: t`Total games played this season`,
					},
					{
						name: t`Total wins`,
						value: ranked2v2.wins,
						desc: t`Total games won this season`,
					},
					{
						name: t`Total losses`,
						value: ranked2v2.games - ranked2v2.wins,
						desc: t`Total games lost this season`,
					},
					{
						name: t`Winrate`,
						value: t`${calculateWinrate(ranked2v2.wins, ranked2v2.games).toFixed(2)}%`,
						desc: t`Winrate (total wins / total games)`,
					},
					{
						name: t`Teammates`,
						value: teamCount,
						desc: t`Number of teammates this season`,
					},
					{
						name: t`Avg. games per teammate`,
						value: (ranked2v2.games / teamCount).toFixed(0),
						desc: t`Average games played per teammate`,
					},
					{
						name: t`Avg. wins per teammate`,
						value: (ranked2v2.wins / teamCount).toFixed(0),
						desc: t`Average games won per teammate`,
					},
					{
						name: t`Avg. losses per teammate`,
						value: ((ranked2v2.games - ranked2v2.wins) / teamCount).toFixed(0),
						desc: t`Average games lost per teammate`,
					},
					{
						name: t`Avg. team rating`,
						value: ranked2v2.average_rating.toFixed(0),
						desc: t`Average team Elo rating`,
					},
					{
						name: t`Avg. team peak rating`,
						value: ranked2v2.average_peak_rating.toFixed(0),
						desc: t`Average team peak Elo rating`,
					},
				]}
			/>
			{ranked2v2.teams.length > 0 && (
				<div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3 mt-4">
					{ranked2v2.teams.map((team) => {
						const eloResetTier = getTierFromRating(team.rating_reset)

						return (
							<Card key={team.teammate.id}>
								<CardHeader>
									<CardTitle className="flex justify-between text-lg font-bold">
										<div>
											<p className="flex items-center gap-1">
												{team.teammate.name}
											</p>
											<p className="text-muted-foreground text-sm">
												& {playerName}
											</p>
										</div>
										<FlagIcon
											region={team.region}
											className="w-8 h-8 rounded-sm"
										/>
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
								</CardContent>
								<CardFooter>
									<StatsGrid
										className="w-full"
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
												value: team.rating_reset,
												desc: t`Elo reset for next season (${eloResetTier})`,
											},
										]}
										gridOverride="grid-cols-3"
									/>
								</CardFooter>
							</Card>
						)
					})}
				</div>
			)}
		</>
	)
}
