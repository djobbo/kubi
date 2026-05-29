import { Card } from "@/shared/components/card"
import { FlagIcon, RankedTierBanner } from "@/shared/components/image"
import { Progress } from "@/shared/components/progress"
import { StatGrid } from "@/shared/components/stat-grid"
import type { RankedRegion } from "@dair/brawlhalla-api"
import type { TierName } from "@dair/api-contract/src/shared/tier"
import type { Player } from "@dair/api-contract/src/routes/v1/brawlhalla/get-player-by-id"
import { cleanString } from "@dair/common/src/helpers/clean-string"
import { Link } from "@tanstack/react-router"
import { t } from "@lingui/core/macro"

type Team = NonNullable<
  NonNullable<(typeof Player.Type)["ranked"]>["2v2"]
>["teams"][number]

type TeamCardProps = {
  playerName: string
  team: Team
}

export const TeamCard = ({ playerName, team }: TeamCardProps) => {
  const losses = team.games - team.wins
  const region = team.region?.toLowerCase() as RankedRegion | undefined

  return (
    <Link
      to="/brawlhalla/players/$playerId/overview"
      params={{ playerId: team.teammate.id.toString() }}
      className="block"
    >
      <Card className="flex flex-col gap-4 transition-colors hover:bg-bg-light">
        <h3 className="flex items-center gap-2 text-sm font-semibold uppercase text-text-muted">
          {region ? (
            <FlagIcon
              region={region}
              containerClassName="h-4 w-4 shrink-0 overflow-hidden rounded-sm"
              className="object-contain object-center"
            />
          ) : null}
          <span>
            {cleanString(playerName)} & {cleanString(team.teammate.name)}
          </span>
        </h3>
        <div className="flex gap-2">
          <RankedTierBanner
            tier={team.tier as TierName}
            alt={team.tier ?? ""}
            containerClassName="h-24 w-18"
            className="object-contain object-center"
          />
          <div className="flex flex-1 flex-col gap-1">
            <span>{team.tier}</span>
            <span className="text-4xl font-bold">
              {team.rating}
              <span className="ml-1 text-sm font-normal text-text-muted">
                / {team.peak_rating} peak
              </span>
            </span>
            <Progress value={team.wins / team.games} max={1} intent="success" />
            <div className="flex justify-between">
              <span>
                {team.wins}W{" "}
                <span className="text-sm font-normal text-text-muted">
                  ({((team.wins / team.games) * 100).toFixed(2)}%)
                </span>
              </span>
              <span>
                {losses}L{" "}
                <span className="text-sm font-normal text-text-muted">
                  ({((losses / team.games) * 100).toFixed(2)}%)
                </span>
              </span>
            </div>
          </div>
        </div>
        <Card variant="inset" className="@container mt-4">
          <StatGrid
            stats={[
              {
                title: t`Games`,
                value: team.games.toLocaleString(),
              },
              {
                title: t`Elo reset`,
                value: team.rating_reset,
              },
            ]}
          />
        </Card>
      </Card>
    </Link>
  )
}
