import { t } from "@lingui/core/macro"

import { Card } from "@/components/base/Card"
import { cn } from "@/ui/lib/utils"

import { GamesDisplay } from "./GamesDisplay"
import { MiscStatGroup } from "./MiscStatGroup"
import { ProgressCard } from "./ProgressCard"

interface GeneralStatsProps {
  className?: string
  games: number
  wins: number
  kos: number
  falls: number
  suicides: number
  teamkos: number
  damageDealt: number
  damageTaken: number
  matchtime: number
}

export const GeneralStats = ({
  className,
  games,
  wins,
  kos,
  falls,
  suicides,
  teamkos,
  damageDealt,
  damageTaken,
  matchtime,
}: GeneralStatsProps) => {
  const kosReference = Math.max(kos, falls, suicides, teamkos)
  const damageReference = Math.max(damageDealt, damageTaken)

  return (
    <>
      <div
        className={cn(
          "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8",
          className,
        )}
      >
        <div>
          <Card title={t`Games`}>
            <GamesDisplay games={games} wins={wins} />
          </Card>
        </div>
        <ProgressCard
          title="kos"
          bars={[
            {
              title: t`KOs`,
              value: kos,
              progress: (kos / kosReference) * 100,
            },
            {
              title: t`Falls`,
              value: falls,
              progress: (falls / kosReference) * 100,
            },
            {
              title: t`Suicides`,
              value: suicides,
              progress: (suicides / kosReference) * 100,
            },
            {
              title: t`Team KOs`,
              value: teamkos,
              progress: (teamkos / kosReference) * 100,
            },
          ]}
        />
        <div>
          <ProgressCard
            title="damage"
            bars={[
              {
                title: t`Damage dealt`,
                value: damageDealt,
                progress: (damageDealt / damageReference) * 100,
              },
              {
                title: t`Damage taken`,
                value: damageTaken,
                progress: (damageTaken / damageReference) * 100,
              },
            ]}
          />
        </div>
      </div>
      <MiscStatGroup
        className="mt-8"
        stats={[
          {
            name: t`DPS (Dealt)`,
            value: `${(damageDealt / matchtime).toFixed(1)} dmg/s`,
            desc: t`Damage dealt per second`,
          },
          {
            name: t`DPS (Taken)`,
            value: `${(damageTaken / matchtime).toFixed(1)} dmg/s`,
            desc: t`Damage taken per second`,
          },
          {
            name: t`Time to kill`,
            value: `${(matchtime / kos).toFixed(1)}s`,
            desc: t`Time between each kill in seconds`,
          },
          {
            name: t`Time to fall`,
            value: `${(matchtime / falls).toFixed(1)}s`,
            desc: t`Time between each fall in seconds`,
          },
          {
            name: t`Avg. Kos per game`,
            value: (kos / games).toFixed(1),
            desc: t`Average Kos per game`,
          },
          {
            name: t`Avg. Falls per game`,
            value: (falls / games).toFixed(1),
            desc: t`Average Falls per game`,
          },
          {
            name: t`1 Suicide every`,
            value: `${(games / suicides).toFixed(1)} games`,
            desc: t`Average games between each suicides`,
          },
          {
            name: t`1 Team KO every`,
            value: `${(games / teamkos).toFixed(1)} games`,
            desc: t`Average games between each Team KO`,
          },
          {
            name: t`Avg. dmg dealt per game`,
            value: (damageDealt / games).toFixed(1),
            desc: t`Average damage dealt per game`,
          },
          {
            name: t`Avg. dmg taken per game`,
            value: (damageTaken / games).toFixed(1),
            desc: t`Average damage taken per game`,
          },
          {
            name: t`Avg. game length`,
            value: `${(matchtime / games).toFixed(1)}s`,
            desc: t`Average game length in seconds`,
          },
        ]}
      />
    </>
  )
}
