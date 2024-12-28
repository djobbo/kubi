import { t } from "@lingui/core/macro"
import type { FullLegend } from "bhapi/legends"
import type { JSX } from "react"

import { Image, LegendIcon } from "@/features/brawlhalla/components/Image"
import { formatTime } from "@/helpers/date"

import { CollapsibleContent } from "../../../layout/CollapsibleContent"
import { GeneralStats } from "../../GeneralStats"
import type { MiscStat } from "../../MiscStatGroup"
import { MiscStatGroup } from "../../MiscStatGroup"
import { PlayerLegendRankedContent } from "./RankedContent"
import { PlayerLegendWeaponDistribution } from "./WeaponDistribution"

interface LegendProps {
  legend: FullLegend
  matchtime: number
  games: number
  displayedInfoFn?: (legend: FullLegend) => JSX.Element
  rank: number
}

export const Legend = ({
  legend,
  matchtime,
  games,
  displayedInfoFn,
  rank,
}: LegendProps) => {
  const legendStats: MiscStat[] = [
    {
      name: t`Level`,
      value: legend.stats?.level ?? 0,
      desc: t`Legend level`,
    },
    {
      name: t`XP`,
      value: legend.stats?.xp ?? 0,
      desc: t`XP earned with this legend`,
    },
    {
      name: t`Time played`,
      value: `${formatTime(legend.stats?.matchtime ?? 0)}`,
      desc: t`Time played with this legend`,
    },
    {
      name: t`Time played (%)`,
      value: `${(((legend.stats?.matchtime ?? 0) / matchtime) * 100).toFixed(
        2,
      )}%`,
      desc: t`Time played with this legend (percentage of total time)`,
    },
    {
      name: t`Usage rate (games)`,
      value: `${(((legend.stats?.games ?? 0) / games) * 100).toFixed(2)}%`,
      desc: t`Usage rate of this legend (percentage of total games)`,
    },
  ]

  return (
    <CollapsibleContent
      key={legend.legend_id}
      className="shadow-md border rounded-lg border-bg"
      triggerClassName="w-full p-4 flex justify-start items-center gap-2"
      contentClassName="px-4 pb-4"
      closingArrow
      trigger={
        <span className="flex items-center justify-between w-full">
          <span className="flex items-center gap-2">
            <span className="text-sm text-textVar1">{rank}</span>
            <LegendIcon
              legendNameKey={legend.legend_name_key}
              alt={legend.bio_name}
              Container="span"
              containerClassName="block w-6 h-6 rounded-lg overflow-hidden"
              className="object-contain object-center"
            />
            {legend.bio_name}
          </span>
          <span className="text-sm text-textVar1">
            {displayedInfoFn?.(legend)}
          </span>
        </span>
      }
    >
      <MiscStatGroup className="mt-2" stats={legendStats} />
      <GeneralStats
        className="mt-2"
        games={legend.stats?.games ?? 0}
        wins={legend.stats?.wins ?? 0}
        kos={legend.stats?.kos ?? 0}
        falls={legend.stats?.falls ?? 0}
        suicides={legend.stats?.suicides ?? 0}
        teamkos={legend.stats?.teamkos ?? 0}
        damageDealt={parseInt(legend.stats?.damagedealt ?? "0")}
        damageTaken={parseInt(legend.stats?.damagetaken ?? "0")}
        matchtime={legend.stats?.matchtime ?? 0}
      />
      <PlayerLegendRankedContent ranked={legend.ranked} />
      <PlayerLegendWeaponDistribution legend={legend} />
    </CollapsibleContent>
  )
}
