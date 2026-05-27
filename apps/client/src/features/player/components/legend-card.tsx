import { Card } from "@/shared/components/card"
import { LegendIcon, RankedTierBanner, WeaponIcon } from "@/shared/components/image"
import { Progress } from "@/shared/components/progress"
import { StatGrid } from "@/shared/components/stat-grid"
import {
  calculateWinrate,
  getLegendOrTeamRatingReset,
  getTierFromRating,
  legendsMap,
} from "@dair/brawlhalla-api"
import type { TierName } from "@dair/api-contract/src/shared/tier"
import type { Player } from "@dair/api-contract/src/routes/v1/brawlhalla/get-player-by-id"
import { formatTime } from "@dair/common/src/helpers/date"
import { cn } from "@dair/common/src/helpers/ui"
import { Collapsible } from "@base-ui-components/react/collapsible"
import { t } from "@lingui/core/macro"
import { Trans } from "@lingui/react/macro"
import { ChevronDownIcon } from "lucide-react"
import { Cell, Pie, PieChart } from "recharts"

type PlayerLegend = (typeof Player.Type)["legends"][number]

type LegendCardProps = {
  legend: PlayerLegend
  matchtime: number
  games: number
  rank: number
}

const collapsiblePanelClassName = cn(
  "h-[var(--collapsible-panel-height)] overflow-hidden",
  "transition-[height] duration-150 ease-out",
  "data-ending-style:h-0 data-starting-style:h-0",
)

export const LegendCard = ({
  legend,
  matchtime,
  games,
  rank,
}: LegendCardProps) => {
  const { stats, ranked, weapon_one, weapon_two, unarmed, weapon_throws, gadgets } =
    legend
  const legendMeta = legendsMap[legend.id]

  const gamesPieData = [
    { name: t`W`, value: stats.wins },
    { name: t`L`, value: stats.games - stats.wins },
  ]

  const kosReference = Math.max(
    stats.kos,
    stats.falls,
    stats.suicides,
    stats.team_kos,
  )
  const damageReference = Math.max(stats.damage_dealt, stats.damage_taken)

  const weapons = [
    { label: weapon_one.name, ...weapon_one },
    { label: weapon_two.name, ...weapon_two },
    {
      label: t`Unarmed`,
      name: "Unarmed",
      damage_dealt: unarmed.damage_dealt,
      kos: unarmed.kos,
      time_held: unarmed.time_held,
    },
  ]

  return (
    <Card className="overflow-hidden p-0">
      <Collapsible.Root>
        <Collapsible.Trigger
          className={cn(
            "group flex w-full items-center justify-between gap-2 p-4 text-left",
            "hover:bg-bg-light focus-visible:outline-none",
          )}
        >
          <span className="flex items-center gap-2">
            <span className="text-sm text-text-muted">{rank}</span>
            {legendMeta ? (
              <LegendIcon
                legendNameKey={legendMeta.legend_name_key}
                containerClassName="h-6 w-6 overflow-hidden rounded-lg"
                className="object-contain object-center"
              />
            ) : null}
            <span className="font-semibold">{legend.name}</span>
          </span>
          <span className="flex items-center gap-2 text-sm text-text-muted">
            {formatTime(stats.matchtime)}
            <ChevronDownIcon className="size-4 shrink-0 transition-transform duration-150 group-data-panel-open:rotate-180" />
          </span>
        </Collapsible.Trigger>
        <Collapsible.Panel className={collapsiblePanelClassName}>
          <div className="flex flex-col gap-4 px-4 pb-4">
            <StatGrid
              stats={[
                { title: t`Level`, value: stats.level },
                { title: t`XP`, value: stats.xp.toLocaleString() },
                {
                  title: t`Time played (%)`,
                  value: `${((stats.matchtime / matchtime) * 100).toFixed(2)}%`,
                },
                {
                  title: t`Usage rate (games)`,
                  value: `${(((stats.games / games) * 100) || 0).toFixed(2)}%`,
                },
              ]}
            />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card variant="inset">
                <h4 className="text-xs font-semibold uppercase text-text-muted">
                  <Trans>Games</Trans>
                </h4>
                <div
                  className="mt-2 grid place-items-center"
                  style={{ gridTemplateAreas: '"content"' }}
                >
                  <span className="[grid-area:content] text-3xl font-bold">
                    {stats.games.toLocaleString()}
                  </span>
                  <PieChart
                    className="[grid-area:content] aspect-square h-full max-h-40 w-full"
                    responsive
                  >
                    <Pie
                      data={gamesPieData}
                      dataKey="value"
                      cx="50%"
                      cy="50%"
                      paddingAngle={10}
                      cornerRadius={9}
                      innerRadius="60%"
                      outerRadius="80%"
                      isAnimationActive={false}
                    >
                      {gamesPieData.map((_entry, index) => (
                        <Cell
                          key={index}
                          className={cn("stroke-none fill-success", {
                            "fill-danger": index === 1,
                          })}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </div>
              </Card>
              <Card variant="inset">
                <h4 className="text-xs font-semibold uppercase text-text-muted">
                  <Trans>KOs</Trans>
                </h4>
                <div className="mt-4 flex flex-col gap-2">
                  {(
                    [
                      { title: t`KOs`, value: stats.kos },
                      { title: t`Falls`, value: stats.falls },
                      { title: t`Suicides`, value: stats.suicides },
                      { title: t`Team KOs`, value: stats.team_kos },
                    ] as const
                  ).map((item) => (
                    <div key={item.title}>
                      <p className="text-sm">
                        {item.value.toLocaleString()}{" "}
                        <span className="text-text-muted">{item.title}</span>
                      </p>
                      <Progress value={item.value} max={kosReference} size="sm" />
                    </div>
                  ))}
                </div>
              </Card>
              <Card variant="inset">
                <h4 className="text-xs font-semibold uppercase text-text-muted">
                  <Trans>Damage</Trans>
                </h4>
                <div className="mt-4 flex flex-col gap-2">
                  {(
                    [
                      { title: t`Damage dealt`, value: stats.damage_dealt },
                      { title: t`Damage taken`, value: stats.damage_taken },
                    ] as const
                  ).map((item) => (
                    <div key={item.title}>
                      <p className="text-sm">
                        {item.value.toLocaleString()}{" "}
                        <span className="text-text-muted">{item.title}</span>
                      </p>
                      <Progress
                        value={item.value}
                        max={damageReference}
                        size="sm"
                      />
                    </div>
                  ))}
                </div>
              </Card>
            </div>
            {ranked && ranked.games > 0 ? (
              <Card variant="inset" className="flex flex-col gap-4">
                <h4 className="text-sm font-semibold uppercase text-text-muted">
                  <Trans>Ranked season</Trans>
                </h4>
                <div className="flex items-center gap-4">
                  <RankedTierBanner
                    tier={ranked.tier as TierName}
                    alt={ranked.tier ?? ""}
                    containerClassName="h-24 w-16"
                    className="object-contain object-center"
                  />
                  <div className="flex flex-1 flex-col gap-1">
                    <span className="text-sm text-text-muted">{ranked.tier}</span>
                    <span className="text-3xl font-bold">
                      {ranked.rating}
                      <span className="ml-1 text-sm font-normal text-text-muted">
                        / {ranked.peak_rating} peak
                      </span>
                    </span>
                    <Progress
                      value={ranked.wins / ranked.games}
                      max={1}
                      intent="success"
                      size="sm"
                    />
                  </div>
                </div>
                <StatGrid
                  stats={[
                    { title: t`Games`, value: ranked.games.toLocaleString() },
                    {
                      title: t`Winrate`,
                      value: `${calculateWinrate(ranked.wins, ranked.games).toFixed(2)}%`,
                    },
                    {
                      title: t`Elo reset`,
                      value: `${getLegendOrTeamRatingReset(ranked.rating)} (${getTierFromRating(getLegendOrTeamRatingReset(ranked.rating))})`,
                    },
                  ]}
                />
              </Card>
            ) : null}
            <div>
              <h4 className="mb-3 text-sm font-semibold uppercase text-text-muted">
                <Trans>Weapon distribution</Trans>
              </h4>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {weapons.map((weapon) => (
                  <Card key={weapon.label} variant="inset">
                    <h5 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                      <WeaponIcon
                        weapon={
                          weapon.name === "Unarmed" ? "Unarmed" : weapon.name
                        }
                        containerClassName="h-6 w-6"
                        className="object-contain object-center"
                      />
                      {weapon.label}
                    </h5>
                    <StatGrid
                      stats={[
                        {
                          title: t`KOs`,
                          value: `${weapon.kos} (${((weapon.kos / stats.kos) * 100).toFixed(2)}%)`,
                        },
                        {
                          title: t`Damage`,
                          value: weapon.damage_dealt.toLocaleString(),
                        },
                        {
                          title: t`Time held`,
                          value: formatTime(weapon.time_held),
                        },
                      ]}
                    />
                  </Card>
                ))}
              </div>
              <StatGrid
                className="mt-4"
                stats={[
                  {
                    title: t`Throw KOs`,
                    value: `${weapon_throws.kos} (${((weapon_throws.kos / stats.kos) * 100).toFixed(2)}%)`,
                  },
                  {
                    title: t`Gadget KOs`,
                    value: `${gadgets.kos} (${((gadgets.kos / stats.kos) * 100).toFixed(2)}%)`,
                  },
                ]}
              />
            </div>
          </div>
        </Collapsible.Panel>
      </Collapsible.Root>
    </Card>
  )
}
