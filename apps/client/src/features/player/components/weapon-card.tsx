import { Card } from "@/shared/components/card"
import { WeaponIcon } from "@/shared/components/image"
import { Progress } from "@/shared/components/progress"
import { StatGrid } from "@/shared/components/stat-grid"
import { calculateWinrate } from "@dair/brawlhalla-api"
import type { Player } from "@dair/api-contract/src/routes/v1/brawlhalla/get-player-by-id"
import { formatTime } from "@dair/common/src/helpers/date"
import { cn } from "@dair/common/src/helpers/ui"
import { Collapsible } from "@base-ui-components/react/collapsible"
import { t } from "@lingui/core/macro"
import { Trans } from "@lingui/react/macro"
import { ChevronDownIcon } from "lucide-react"
import { Cell, Pie, PieChart } from "recharts"

type PlayerWeapon = (typeof Player.Type)["weapons"][number]

type WeaponCardProps = {
  weapon: PlayerWeapon
  matchtime: number
  games: number
  rank: number
}

const collapsiblePanelClassName = cn(
  "h-[var(--collapsible-panel-height)] overflow-hidden",
  "transition-[height] duration-150 ease-out",
  "data-ending-style:h-0 data-starting-style:h-0",
)

export const WeaponCard = ({
  weapon,
  matchtime,
  games,
  rank,
}: WeaponCardProps) => {
  const { stats, legends: weaponLegends } = weapon
  const losses = stats.games - stats.wins

  const gamesPieData = [
    { name: t`W`, value: stats.wins },
    { name: t`L`, value: losses },
  ]

  return (
    <Card className="overflow-hidden p-0">
      <Collapsible.Root>
        <Collapsible.Trigger
          className={cn(
            "group flex w-full items-center gap-2 p-4 text-left",
            "hover:bg-bg-light focus-visible:outline-none",
          )}
        >
          <span className="text-sm text-text-muted">{rank}</span>
          <WeaponIcon
            weapon={weapon.name}
            containerClassName="h-6 w-6"
            className="object-contain object-center"
          />
          <span className="font-semibold">{weapon.name}</span>
          <span className="ml-auto flex items-center gap-2 text-sm text-text-muted">
            {formatTime(stats.time_held)}
            <ChevronDownIcon className="size-4 shrink-0 transition-transform duration-150 group-data-panel-open:rotate-180" />
          </span>
        </Collapsible.Trigger>
        <Collapsible.Panel className={collapsiblePanelClassName}>
          <div className="flex flex-col gap-4 px-4 pb-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Card variant="inset">
                <h4 className="text-xs font-semibold uppercase text-text-muted">
                  <Trans>Games</Trans>
                </h4>
                <div
                  className="mt-2 grid place-items-center"
                  style={{ gridTemplateAreas: '"content"' }}
                >
                  <div className="[grid-area:content] flex flex-col items-center">
                    <span className="text-3xl font-bold">
                      {stats.games.toLocaleString()}
                    </span>
                    <span className="text-sm text-text-muted">
                      {calculateWinrate(stats.wins, stats.games).toFixed(2)}% {t`WR`}
                    </span>
                  </div>
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
                  <Trans>Combat</Trans>
                </h4>
                <div className="mt-4 flex flex-col gap-2">
                  <div>
                    <p className="text-sm">
                      {stats.kos.toLocaleString()}{" "}
                      <span className="text-text-muted">{t`KOs`}</span>
                    </p>
                    <Progress
                      value={stats.kos}
                      max={stats.kos}
                      size="sm"
                      intent="success"
                    />
                  </div>
                  <p className="text-sm">
                    {stats.damage_dealt.toLocaleString()}{" "}
                    <span className="text-text-muted">{t`Damage dealt`}</span>
                  </p>
                </div>
              </Card>
            </div>
            <StatGrid
              stats={[
                { title: t`Weapon level`, value: stats.level.toLocaleString() },
                { title: t`Weapon XP`, value: stats.xp.toLocaleString() },
                {
                  title: t`Time held (%)`,
                  value: `${((stats.time_held / matchtime) * 100).toFixed(2)}%`,
                },
                {
                  title: t`Usage rate (games)`,
                  value: `${((stats.games / games) * 100).toFixed(2)}%`,
                },
                {
                  title: t`DPS`,
                  value: `${(stats.damage_dealt / stats.time_held).toFixed(2)} dmg/s`,
                },
              ]}
            />
            <div className="flex flex-col gap-2">
              <h4 className="text-xs font-semibold uppercase text-text-muted">
                <Trans>Legends using this weapon</Trans>
              </h4>
              {weaponLegends.map((legend) => (
                <div
                  key={legend.id}
                  className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm"
                >
                  <span>{legend.name}</span>
                  <span className="text-xs text-text-muted">
                    {legend.kos} {t`KOs`} · {formatTime(legend.time_held)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Collapsible.Panel>
      </Collapsible.Root>
    </Card>
  )
}
