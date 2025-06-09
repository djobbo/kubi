import { t } from "@lingui/core/macro"
import { ArrowDownWideNarrow, ArrowUpWideNarrow } from "lucide-react"

import { Select } from "@/components/base/Select"
import type { PlayerRanked } from "@/features/brawlhalla/api/schema/player-ranked"
import { calculateWinrate } from "@/features/brawlhalla/helpers/winrate"
import { SortDirection, useSortBy } from "@/hooks/useSortBy"

import type { MiscStat } from "../../MiscStatGroup"
import { MiscStatGroup } from "../../MiscStatGroup"
import { TeamCard } from "../../TeamCard"

interface Player2v2TabProps {
  ranked: PlayerRanked
}

type TeamSortOption =
  | "games"
  | "wins"
  | "losses"
  | "winrate"
  | "rating"
  | "peak_rating"

export const Player2v2Tab = ({ ranked }: Player2v2TabProps) => {
  const teams = ranked["2v2"]
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

  const {
    sortedArray: sortedTeams,
    sortBy: teamSortBy,
    setSortBy: sortTeamBy,
    options: teamSortOptions,
    changeSortDirection: changeTeamSortDirection,
    sortDirection: teamSortDirection,
  } = useSortBy<PlayerRanked["2v2"][number], TeamSortOption>(
    teams,
    {
      games: {
        label: t`Games`,
        sortFn: (a, b) => (a.games ?? 0) - (b.games ?? 0),
      },
      wins: {
        label: t`Wins`,
        sortFn: (a, b) => (a.wins ?? 0) - (b.wins ?? 0),
      },
      losses: {
        label: t`Losses`,
        sortFn: (a, b) =>
          (a.games ?? 0) - (a.wins ?? 0) - ((b.games ?? 0) - (b.wins ?? 0)),
      },
      winrate: {
        label: t`Winrate`,
        sortFn: (a, b) =>
          calculateWinrate(a.wins ?? 0, a.games ?? 0) -
          calculateWinrate(b.wins ?? 0, b.games ?? 0),
      },
      rating: {
        label: t`Elo`,
        sortFn: (a, b) => (a.rating ?? 0) - (b.rating ?? 0),
      },
      peak_rating: {
        label: t`Peak elo`,
        sortFn: (a, b) => (a.peak_rating ?? 0) - (b.peak_rating ?? 0),
      },
    },
    "rating",
    SortDirection.Descending,
  )

  const teamCount = teams.length

  const global2v2Stats: MiscStat[] = [
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
  ]

  return (
    <>
      <MiscStatGroup className="mt-8" stats={global2v2Stats} />
      <div className="mt-14 flex-1 flex gap-4 items-center w-full">
        <Select<TeamSortOption>
          className="flex-1"
          onChange={sortTeamBy}
          value={teamSortBy}
          options={teamSortOptions}
          label="Sort by"
        />
        <button
          type="button"
          onClick={changeTeamSortDirection}
          className="flex items-center hover:text-accent-foreground"
        >
          {teamSortDirection === SortDirection.Ascending ? (
            <ArrowUpWideNarrow className="w-6 h-6" />
          ) : (
            <ArrowDownWideNarrow className="w-6 h-6" />
          )}
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-8 gap-8">
        {sortedTeams.map((team) => (
          <TeamCard
            key={`${team.brawlhalla_id_one}+${team.brawlhalla_id_two}`}
            playerId={ranked.brawlhalla_id}
            team={team}
          />
        ))}
      </div>
    </>
  )
}
