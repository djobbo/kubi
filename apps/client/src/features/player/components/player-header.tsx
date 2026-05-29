import { Card } from "@/shared/components/card"
import { FlagIcon, LegendIcon, WeaponIcon } from "@/shared/components/image"
import { StatGrid } from "@/shared/components/stat-grid"
import { MAX_SHOWN_ALIASES } from "@dair/brawlhalla-api"
import { legendsMap, type RankedRegion } from "@dair/brawlhalla-api"
import type { Player } from "@dair/api-contract/src/routes/v1/brawlhalla/get-player-by-id"
import { formatTime } from "@dair/common/src/helpers/date"
import { t } from "@lingui/core/macro"
import type { ReactNode } from "react"

type PlayerHeaderProps = {
  player: typeof Player.Type
}

export const PlayerHeader = ({ player }: PlayerHeaderProps) => {
  const { name, id, aliases, stats, ranked, legends, weapons } = player
  const ranked1v1 = ranked?.["1v1"]
  const region = ranked1v1?.region?.toLowerCase() as RankedRegion | undefined

  const topLegends = [...legends]
    .sort((a, b) => b.stats.matchtime - a.stats.matchtime)
    .slice(0, 3)

  const topWeapons = [...weapons]
    .sort((a, b) => b.stats.time_held - a.stats.time_held)
    .slice(0, 3)

  const accountStats: {
    title: string
    value: ReactNode
    description?: string
  }[] = [
    {
      title: t`Account level`,
      value: stats.level,
    },
    {
      title: t`Account XP`,
      value: stats.xp.toLocaleString(),
    },
    {
      title: t`In-game time`,
      value: formatTime(stats.matchtime),
    },
    {
      title: t`Main legends`,
      value: (
        <div className="flex gap-1">
          {topLegends.map((legend) => (
            <LegendIcon
              key={legend.id}
              legendNameKey={legendsMap[legend.id]!.legend_name_key}
              containerClassName="h-8 w-8 overflow-hidden rounded-sm"
              className="object-contain object-center"
            />
          ))}
        </div>
      ),
    },
    {
      title: t`Main weapons`,
      value: (
        <div className="flex gap-1">
          {topWeapons.map((weapon) => (
            <WeaponIcon
              key={weapon.name}
              weapon={weapon.name}
              containerClassName="h-8 w-8"
              className="object-contain object-center"
            />
          ))}
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-2">
      <div className="mt-2 flex items-center gap-2">
        {region ? (
          <FlagIcon
            region={region}
            containerClassName="h-8 w-8 overflow-hidden rounded-md border border-border"
            className="object-contain object-center"
          />
        ) : null}
        <h1 className="text-3xl font-semibold">{name}</h1>
        <span className="text-xs font-bold text-text-muted">#{id}</span>
      </div>
      {aliases.length > 0 ? (
        <div className="-ml-0.5 flex flex-wrap gap-x-1 gap-y-2">
          {aliases.slice(0, MAX_SHOWN_ALIASES).map((alias) => (
            <span
              key={alias}
              className="corner-smooth-4xl border border-border bg-bg-light px-2 py-0.5 text-xs text-text-muted hover:bg-bg-light/60"
            >
              {alias}
            </span>
          ))}
        </div>
      ) : null}
      <Card variant="inset" className="@container mt-2">
        <StatGrid stats={accountStats} />
      </Card>
    </div>
  )
}
