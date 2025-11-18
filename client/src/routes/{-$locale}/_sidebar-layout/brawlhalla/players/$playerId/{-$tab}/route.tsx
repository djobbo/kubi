import { formatTime } from '@dair/common/src/helpers/date'
import { SEO } from '@dair/common/src/helpers/seo'  
import { createFileRoute, notFound, useLocation } from '@tanstack/react-router'
import { Schema } from 'effect'
import { Card } from '@/shared/components/card'
import { StatGrid } from '@/shared/components/stat-grid'
import { Tab } from '@/shared/components/tabs'
import { OverviewTab } from './-overview-tab'
import { TeamsTab } from './-teams-tab'
import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { Result, useAtomValue } from '@effect-atom/atom-react'
import { ApiClient } from '@/shared/api-client'

const playerIdRegex = /(^\d+).*/
/**
 * Schema for the player ID parameter.
 * @example
 * ```
 * "abcdef" -> null
 * "1234567890-abcdef" -> 1234567890
 * "abcdef-1234567890" -> null
 * "1234567890-abcdef-ghijklmnopqrstuvwxyz" -> 1234567890
 */
const PlayerIdParamSchema = Schema.transform(
  Schema.NonEmptyTrimmedString,
  Schema.NullOr(Schema.Number),
  {
    strict: true,
    decode: (input) => {
      const match = input.match(playerIdRegex)
      const parsed = match?.[1]
      if (!parsed) return null

      try {
        return Number.parseInt(parsed, 10)
      } catch (error) {
        return null
      }
    },
    encode: (input) => (input ?? '').toString(),
  },
)

const ParamsSchema = Schema.Struct({
  playerId: PlayerIdParamSchema,
})

const decodeParams = Schema.decodePromise(ParamsSchema)

export const Route = createFileRoute(
  '/{-$locale}/_sidebar-layout/brawlhalla/players/$playerId/{-$tab}',
)({
  component: RouteComponent,
  async loader({ params }) {
    const { playerId } = await decodeParams(params)

    if (!playerId) {
      throw notFound()
    }

    return {
      playerId,
    }
  },
  staleTime: 5 * 60 * 1000,
})

function RouteComponent() {
  const { playerId } = Route.useLoaderData()
  const { pathname } = useLocation()
  const playerDataResult = useAtomValue(
    ApiClient.query('brawlhalla', 'get-player-by-id', {
      path: { id: playerId },
      reactivityKeys: ['brawlhalla-player-id', playerId],
    }),
  )

  return Result.builder(playerDataResult)
    .onInitialOrWaiting(() => {
      return <div className="px-8 pt-4 flex flex-col gap-2">Loading...</div>
    })
    .onSuccess(({ data: playerData }) => {
      const selectedTabIndex = pathname
        .split('/')
        .findIndex((part) => part.startsWith(playerId.toString()))
      const selectedTab =
        pathname.split('/')[selectedTabIndex + 1] || 'overview'

      const { name, aliases, stats, ranked } = playerData
      const { '2v2': ranked2v2 } = ranked ?? {}

      return (
        <>
          <SEO
            title={`${name} - Player Stats • Corehalla`}
            description={`${name} - Brawlhalla Player Stats • Corehalla`}
          />
          <div className="px-4 pt-4 flex flex-col gap-2">
            <div className="mt-2">
              <div className="flex items-center gap-2 uppercase text-text-muted text-xs">
                <span>brawlhalla</span>
                {'/'}
                <span>
                  <Trans>players</Trans>
                </span>
                {'/'}
                <span>#{playerData.id}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <img
                src="/assets/images/brand/logos/logo-256x256.png"
                alt={name}
                className="w-8 h-8 rounded-lg border border-border"
              />
              <h1 className="text-3xl font-semibold">{name}</h1>
            </div>
            {aliases.length > 0 && (
              <div className="flex gap-x-1 gap-y-2 flex-wrap -ml-0.5">
                {aliases.map((alias) => (
                  <span
                    key={alias}
                    className="text-xs text-text-muted bg-bg-light rounded-full px-2 py-0.5 border border-border hover:bg-bg-light/60"
                  >
                    {alias}
                  </span>
                ))}
              </div>
            )}
            <Card variant="inset" className="@container mt-4">
              <StatGrid
                stats={[
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
                ]}
              />
            </Card>
            <nav>
              <ul className="flex">
                <li>
                  <Tab
                    active={selectedTab === 'overview'}
                    to="/brawlhalla/players/$playerId/overview"
                    params={{ playerId: playerData.slug }}
                  >
                    Overview
                  </Tab>
                </li>
                {(ranked2v2?.teams?.length ?? 0) > 0 && (
                  <li>
                    <Tab
                      active={selectedTab === '2v2'}
                      to="/brawlhalla/players/$playerId/2v2"
                      params={{ playerId: playerData.slug }}
                    >
                      2v2
                    </Tab>
                  </li>
                )}
                <li>
                  <Tab
                    active={selectedTab === 'legends'}
                    to="/brawlhalla/players/$playerId/legends"
                    params={{ playerId: playerData.slug }}
                  >
                    Legends
                  </Tab>
                </li>
              </ul>
            </nav>
          </div>
          <div className="@container p-4 bg-bg-dark">
            {selectedTab === 'overview' && (
              <OverviewTab playerData={playerData} />
            )}
            {selectedTab === '2v2' && <TeamsTab ranked={ranked} />}
          </div>
        </>
      )
    })
    .onFailure((error) => {
      return (
        <div className="px-8 pt-4">
          Error {';)'} <pre>{error.toString()}</pre>
          <pre>{JSON.stringify(error, null, 2)}</pre>
        </div>
      )
    })
    .render()
}
