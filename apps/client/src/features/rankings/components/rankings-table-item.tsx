import { FlagIcon, RankedTierIcon } from "@/shared/components/image"
import { Progress } from "@/shared/components/progress"
import type { Region } from "@dair/api-contract/src/shared/region"
import type { TierName } from "@dair/api-contract/src/shared/tier"
import { calculateWinrate } from "@dair/brawlhalla-api"
import type { RankedRegion } from "@dair/brawlhalla-api/src/constants/ranked/regions"
import { cn } from "@dair/common/src/helpers/ui"
import type { ReactNode } from "react"

type RankingsTableItemProps = {
  className?: string
  index?: number
  rank: number
  region: typeof Region.Type
  games: number
  wins: number
  rating: number
  peak_rating: number
  tier: TierName
  content: ReactNode
}

const toFlagRegion = (region: typeof Region.Type): RankedRegion =>
  region === null ? "all" : region

export const RankingsTableItem = ({
  className,
  index = 0,
  rank,
  region,
  games,
  wins,
  rating,
  peak_rating,
  content,
  tier,
}: RankingsTableItemProps) => {
  const winrate = calculateWinrate(wins, games)
  const losses = games - wins
  const flagRegion = toFlagRegion(region)

  return (
    <>
      <div
        className={cn(
          "block md:hidden",
          "w-full items-center gap-4 px-4 py-2 hover:bg-bg-light",
          index % 2 === 0 ? "bg-bg" : "bg-bg-light/40",
          className,
        )}
      >
        <div className="flex items-center gap-2 border-b border-border py-1">
          <span className="mr-2 text-lg font-semibold text-text-muted">
            {rank}
          </span>
          {content}
          <RankedTierIcon
            tier={tier}
            containerClassName="h-6 w-6 overflow-hidden rounded-md"
            className="object-contain object-center"
          />
        </div>
        <div className="mt-2 flex flex-col gap-2">
          <p className="flex items-baseline gap-2 text-2xl font-bold">
            {region ? (
              <FlagIcon
                region={flagRegion}
                containerClassName="h-4 w-4 overflow-hidden rounded-sm"
                className="object-contain object-center"
              />
            ) : null}
            {rating}
            <span className="text-sm text-text-muted">/ {peak_rating}</span>
          </p>
          <Progress value={wins} max={games} intent="success" size="sm" />
          <div className="flex justify-between text-sm font-bold">
            <span>
              {wins}W{" "}
              <span className="text-xs text-text-muted">
                ({winrate.toFixed(2)}%)
              </span>
            </span>
            <span>
              {losses}L{" "}
              <span className="text-xs text-text-muted">
                ({calculateWinrate(losses, games).toFixed(2)}%)
              </span>
            </span>
          </div>
        </div>
      </div>
      <div
        className={cn(
          "hidden md:flex",
          "h-full w-full items-center gap-4 py-1 hover:bg-bg-light",
          index % 2 === 0 ? "bg-bg" : "bg-bg-light/40",
          className,
        )}
      >
        <p className="flex h-full w-16 items-center justify-center text-xs">
          {rank}
        </p>
        <p className="flex h-full w-8 items-center justify-center text-xs">
          <RankedTierIcon
            tier={tier}
            containerClassName="h-8 w-8 overflow-hidden rounded-md"
            className="object-contain object-center"
          />
        </p>
        <p className="flex h-full w-16 items-center justify-center text-xs uppercase">
          {region ?? "—"}
        </p>
        {content}
        <p className="w-16 text-center">{games}</p>
        <div className="w-32">
          <Progress value={wins} max={games} intent="success" size="sm" />
          <div className="mt-2 flex justify-between text-xs">
            <span>{wins}W</span>
            <span>{losses}L</span>
          </div>
        </div>
        <p className="w-20 text-center">{winrate.toFixed(2)}%</p>
        <div className="flex w-40 items-center justify-start">
          <p>
            <span className="text-xl font-bold">{rating}</span>{" "}
            <span className="text-sm text-text-muted">
              / {peak_rating} peak
            </span>
          </p>
        </div>
      </div>
    </>
  )
}
