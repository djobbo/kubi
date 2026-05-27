import { StatGrid } from "@/shared/components/stat-grid"
import { calculateWinrate } from "@dair/brawlhalla-api"
import type { Player } from "@dair/api-contract/src/routes/v1/brawlhalla/get-player-by-id"
import { t } from "@lingui/core/macro"

import { TeamCard } from "./team-card"

type PlayerTeamsTabProps = {
  playerName: string
  ranked: NonNullable<(typeof Player.Type)["ranked"]>
}

export const PlayerTeamsTab = ({ playerName, ranked }: PlayerTeamsTabProps) => {
  const ranked2v2 = ranked["2v2"]
  if (!ranked2v2) return null

  const teams = ranked2v2.teams
  const totals = teams.reduce(
    (acc, team) => ({
      totalWins: acc.totalWins + team.wins,
      totalGames: acc.totalGames + team.games,
      totalRating: acc.totalRating + team.rating,
      totalPeakRating: acc.totalPeakRating + team.peak_rating,
    }),
    {
      totalWins: 0,
      totalGames: 0,
      totalRating: 0,
      totalPeakRating: 0,
    },
  )

  const teamCount = teams.length

  return (
    <>
      <StatGrid
        className="mt-4"
        stats={[
          { title: t`Total games`, value: totals.totalGames.toLocaleString() },
          { title: t`Total wins`, value: totals.totalWins.toLocaleString() },
          {
            title: t`Total losses`,
            value: (totals.totalGames - totals.totalWins).toLocaleString(),
          },
          {
            title: t`Winrate`,
            value: `${calculateWinrate(totals.totalWins, totals.totalGames).toFixed(2)}%`,
          },
          { title: t`Teammates`, value: teamCount.toLocaleString() },
          {
            title: t`Avg. games per teammate`,
            value: (totals.totalGames / teamCount).toFixed(2),
          },
          {
            title: t`Avg. team rating`,
            value: (totals.totalRating / teamCount).toFixed(0),
          },
        ]}
      />
      <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {teams.map((team) => (
          <TeamCard key={team.teammate.id} playerName={playerName} team={team} />
        ))}
      </div>
    </>
  )
}
