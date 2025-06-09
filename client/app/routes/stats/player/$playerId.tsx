import { t } from "@lingui/core/macro"
import { Trans } from "@lingui/react/macro"
import {
  Root as Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@radix-ui/react-tabs"
import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"

import { getAliases } from "@/features/archive/functions/aliases/get-aliases"
import {
  getPlayerRanked,
  getPlayerStats,
} from "@/features/brawlhalla/api/functions"
import {
  FlagIcon,
  LegendIcon,
  WeaponIcon,
} from "@/features/brawlhalla/components/Image"
import type { MiscStat } from "@/features/brawlhalla/components/stats/MiscStatGroup"
import { Player2v2Tab } from "@/features/brawlhalla/components/stats/player/Player2v2Tab"
import { PlayerLegendsTab } from "@/features/brawlhalla/components/stats/player/PlayerLegendsTab"
import { PlayerOverviewTab } from "@/features/brawlhalla/components/stats/player/PlayerOverviewTab"
import { PlayerWeaponsTab } from "@/features/brawlhalla/components/stats/player/PlayerWeaponsTab"
import { StatsHeader } from "@/features/brawlhalla/components/stats/StatsHeader"
import {
  getFullLegends,
  getFullWeapons,
  getLegendsAccumulativeData,
} from "@/features/brawlhalla/helpers/parser"
import { cleanString } from "@/helpers/cleanString"
import { formatTime } from "@/helpers/date"
import { seo } from "@/helpers/seo"
import { css } from "@/panda/css"
import { cn } from "@/ui/lib/utils"
import { colors } from "@/ui/theme"

const tabClassName = cn(
  "px-6 py-4 uppercase text-xs border-b-2 z-10 whitespace-nowrap",
  css({
    borderColor: "transparent",
    color: colors.muted,
    '&[data-state="active"]': {
      borderColor: colors.accent,
      color: colors.text,
    },
    "&:hover": {
      backgroundColor: colors.secondary,
      borderColor: colors.text,
      color: colors.text,
    },
  }),
)

export const Route = createFileRoute("/stats/player/$playerId")({
  component: RouteComponent,
  loader: async ({ params: { playerId } }) => {
    const id = z.coerce.number().parse(playerId)

    const [stats, ranked, aliases] = await Promise.all([
      getPlayerStats({ data: id }),
      getPlayerRanked({ data: id }),
      getAliases({ data: { query: { playerId, limit: 5 } } }),
    ] as const)

    return {
      player: {
        id,
        stats,
        ranked,
        aliases,
      },
    }
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {}

    const {
      player: {
        stats: { name },
      },
    } = loaderData

    return {
      meta: seo({
        title: t`${name} - Player Stats • Corehalla`,
        description: t`${name} Stats - Brawlhalla Player Stats • Corehalla`,
      }),
    }
  },
})

function RouteComponent() {
  const { player } = Route.useLoaderData()

  const playerName = cleanString(player.stats.name)

  const fullLegends = getFullLegends(
    player.stats.legends,
    player.ranked?.legends,
  )

  const { matchtime, kos, falls, suicides, teamkos, damagedealt, damagetaken } =
    getLegendsAccumulativeData(fullLegends)

  const weapons = getFullWeapons(fullLegends)

  const legendsSortedByLevel = fullLegends
    .slice(0)
    .sort((a, b) => (b.stats?.matchtime ?? 0) - (a.stats?.matchtime ?? 0))

  const accountStats: MiscStat[] = [
    {
      name: t`Account level`,
      value: player.stats.level,
      desc: t`${playerName}'s account level`,
    },
    {
      name: t`Account XP`,
      value: player.stats.xp,
      desc: t`${playerName}'s account XP`,
    },
    {
      name: t`Game time`,
      value: formatTime(matchtime),
      desc: t`Time ${playerName} spent in game`,
    },
    {
      name: t`Main legends`,
      value: (
        <div className="flex gap-1">
          {legendsSortedByLevel.slice(0, 3).map((legend) => (
            <LegendIcon
              key={legend.legend_id}
              legendNameKey={legend.legend_name_key}
              alt={legend.bio_name}
              containerClassName="w-8 h-8 overflow-hidden rounded-sm"
              className="object-contain object-center"
            />
          ))}
        </div>
      ),
      desc: t`${playerName}'s main legends`,
    },
    {
      name: t`Main weapons`,
      value: (
        <div className="flex gap-1">
          {weapons
            .map(({ weapon, legends }) => ({
              weapon,
              matchtime: legends.reduce((acc, legend) => {
                const matchtime =
                  weapon === legend.weapon_one
                    ? legend.stats?.timeheldweaponone
                    : legend.stats?.timeheldweapontwo
                return acc + (matchtime ?? 0)
              }, 0),
            }))
            .sort((a, b) => b.matchtime - a.matchtime)
            .slice(0, 3)
            .map((weapon) => (
              <WeaponIcon
                key={weapon.weapon}
                weapon={weapon.weapon}
                alt={weapon.weapon}
                containerClassName="w-8 h-8"
                className="object-contain object-center"
              />
            ))}
        </div>
      ),
      desc: t`${playerName}'s main weapons`,
    },
  ]

  return (
    <>
      <StatsHeader
        name={cleanString(playerName)}
        id={player.stats.brawlhalla_id}
        aliases={player.aliases
          .map((alias) => alias.alias)
          .filter(
            (alias) => alias !== playerName && alias !== player.stats.name,
          )}
        miscStats={accountStats}
        icon={
          player.ranked?.region && (
            <FlagIcon
              region={player.ranked.region}
              alt={t`Region Flag`}
              containerClassName="mt-2 w-6 h-6 rounded overflow-hidden mr-2"
              className="object-contain object-center"
            />
          )
        }
        bookmark={{
          pageType: "player_stats",
          pageId: player.stats.brawlhalla_id.toString(),
          name: cleanString(playerName),
          meta: {
            version: "1",
            data: {
              icon: {
                type: "legend",
                id: legendsSortedByLevel[0].legend_id,
              },
            },
          },
        }}
      />
      <Tabs defaultValue="overview">
        <TabsList className="relative flex mt-8 before:absolute before:inset-x-0 before:bottom-0 before:h-0.5 before:bg-background overflow-x-scroll">
          <TabsTrigger value="overview" className={tabClassName}>
            <Trans>Overview</Trans>
          </TabsTrigger>
          {player.ranked && player.ranked["2v2"].length > 0 && (
            <TabsTrigger value="2v2" className={tabClassName}>
              <Trans>2v2 Ranked</Trans>
            </TabsTrigger>
          )}
          <TabsTrigger value="legends" className={tabClassName}>
            <Trans>Legends</Trans>
          </TabsTrigger>
          <TabsTrigger value="weapons" className={tabClassName}>
            <Trans>Weapons</Trans>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <PlayerOverviewTab
            stats={player.stats}
            ranked={player.ranked}
            legends={fullLegends}
            damageDealt={damagedealt}
            damageTaken={damagetaken}
            kos={kos}
            falls={falls}
            suicides={suicides}
            teamkos={teamkos}
            matchtime={matchtime}
          />
        </TabsContent>
        {player.ranked && player.ranked["2v2"].length > 0 && (
          <TabsContent value="2v2">
            <Player2v2Tab ranked={player.ranked} />
          </TabsContent>
        )}
        <TabsContent value="legends">
          <PlayerLegendsTab
            legends={fullLegends}
            matchtime={matchtime}
            games={player.stats.games}
          />
        </TabsContent>
        <TabsContent value="weapons">
          <PlayerWeaponsTab
            weapons={weapons}
            matchtime={matchtime}
            games={player.stats.games}
          />
        </TabsContent>
      </Tabs>
    </>
  )
}
