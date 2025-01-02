import { t } from "@lingui/core/macro"
import { Trans } from "@lingui/react/macro"
import { ChartColumnBig, Flame, Hand, Target } from "lucide-react"

import type { PlayerRanked } from "@/features/brawlhalla/api/schema/player-ranked"
import type { PlayerStats } from "@/features/brawlhalla/api/schema/player-stats"
import {
  type FullLegend,
  getWeaponlessData,
} from "@/features/brawlhalla/helpers/parser"
import { formatTime } from "@/helpers/date"

import { CollapsibleSection } from "../../../layout/CollapsibleSection"
import { GeneralStats } from "../../GeneralStats"
import type { MiscStat } from "../../MiscStatGroup"
import { MiscStatGroup } from "../../MiscStatGroup"
import { PlayerOverviewClanContent } from "./ClanContent"
import { PlayerOverviewRankedContent } from "./RankedContent"

interface PlayerOverviewTabProps {
  stats: PlayerStats
  ranked?: PlayerRanked
  legends: FullLegend[]
  kos: number
  falls: number
  suicides: number
  teamkos: number
  damageDealt: number
  damageTaken: number
  matchtime: number
}

export const PlayerOverviewTab = ({
  stats,
  ranked,
  legends,
  kos,
  falls,
  suicides,
  teamkos,
  damageDealt,
  damageTaken,
  matchtime,
}: PlayerOverviewTabProps) => {
  const { clan } = stats
  const { unarmed, gadgets, throws } = getWeaponlessData(legends)

  const generalStats: MiscStat[] = [
    {
      name: t`Time unarmed`,
      value: `${formatTime(unarmed.matchtime)}`,
      desc: t`Time played unarmed`,
    },
    {
      name: t`Time unarmed (%)`,
      value: `${((unarmed.matchtime / matchtime) * 100).toFixed(2)}%`,
      desc: t`Time played unarmed (percentage of total time)`,
    },
    {
      name: t`KOs`,
      value: unarmed.kos,
      desc: t`Unarmed KOs`,
    },
    {
      name: t`Avg. Kos per game`,
      value: (unarmed.kos / stats.games).toFixed(2),
      desc: t`Average unarmed KOs per game`,
    },
    {
      name: t`Damage Dealt`,
      value: unarmed.damageDealt,
      desc: t`Damage dealt unarmed`,
    },
    {
      name: "DPS",
      value: `${(unarmed.damageDealt / unarmed.matchtime).toFixed(2)} dmg/s`,
      desc: t`Damage dealt unarmed per second`,
    },
    {
      name: t`Avg. dmg dealt per game`,
      value: (unarmed.damageDealt / stats.games).toFixed(2),
      desc: t`Average damage dealt unarmed per game`,
    },
  ]

  const gadgetsStats: MiscStat[] = [
    {
      name: t`KOs`,
      value: gadgets.kos,
      desc: t`Gadgets KOs`,
    },
    {
      name: t`1 Ko every`,
      value: `${(stats.games / gadgets.kos).toFixed(1)} games`,
      desc: t`Average games between each gadget KO`,
    },
    {
      name: t`Damage Dealt`,
      value: gadgets.damageDealt,
      desc: t`Damage dealt with gadgets`,
    },
    {
      name: t`Avg. dmg dealt per game`,
      value: (gadgets.damageDealt / stats.games).toFixed(2),
      desc: t`Average damage dealt with gadgets per game`,
    },
  ]

  const throwsStats: MiscStat[] = [
    {
      name: t`KOs`,
      value: throws.kos,
      desc: t`KOs with thrown items`,
    },
    {
      name: t`1 Ko every`,
      value: `${(stats.games / throws.kos).toFixed(1)} games`,
      desc: t`Average games between each thrown item KO`,
    },
    {
      name: t`Damage Dealt`,
      value: throws.damageDealt,
      desc: t`Damage dealt with thrown items`,
    },
    {
      name: t`Avg. dmg dealt per game`,
      value: (throws.damageDealt / stats.games).toFixed(2),
      desc: t`Damage dealt with thrown items per game`,
    },
  ]

  return (
    <>
      {ranked && <PlayerOverviewRankedContent ranked={ranked} />}
      {clan && <PlayerOverviewClanContent playerStats={stats} />}
      <CollapsibleSection
        trigger={
          <>
            <ChartColumnBig size={20} className="fill-accentVar1" />
            <Trans>General Stats</Trans>
          </>
        }
      >
        <GeneralStats
          className="mt-2"
          games={stats.games}
          wins={stats.wins}
          kos={kos}
          falls={falls}
          suicides={suicides}
          teamkos={teamkos}
          damageDealt={damageDealt}
          damageTaken={damageTaken}
          matchtime={matchtime}
        />
      </CollapsibleSection>
      <CollapsibleSection
        trigger={
          <>
            <Hand size={20} className="fill-accentVar1" />
            <Trans>Unarmed</Trans>
          </>
        }
      >
        <MiscStatGroup className="mt-8" stats={generalStats} />
      </CollapsibleSection>
      <CollapsibleSection
        trigger={
          <>
            <Target size={20} className="stroke-accentVar1" />
            <Trans>Weapon Throws</Trans>
          </>
        }
      >
        <MiscStatGroup className="mt-8" stats={throwsStats} />
      </CollapsibleSection>
      <CollapsibleSection
        trigger={
          <>
            <Flame size={20} className="fill-accentVar1" />
            <Trans>Gadgets</Trans>
          </>
        }
      >
        <MiscStatGroup className="mt-8" stats={gadgetsStats} />
      </CollapsibleSection>
    </>
  )
}
