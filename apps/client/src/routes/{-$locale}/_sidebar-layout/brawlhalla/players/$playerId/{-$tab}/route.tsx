import { PlayerHeader } from "@/features/player/components/player-header"
import { PlayerLegendsTab } from "@/features/player/components/player-legends-tab"
import { PlayerOverviewTab } from "@/features/player/components/player-overview-tab"
import { PlayerTeamsTab } from "@/features/player/components/player-teams-tab"
import { PlayerWeaponsTab } from "@/features/player/components/player-weapons-tab"
import { SEO } from "@dair/common/src/helpers/seo"
import { createFileRoute, notFound, useLocation } from "@tanstack/react-router"
import { Schema, SchemaTransformation } from "effect"
import { Tab } from "@/shared/components/tabs"
import { Trans } from "@lingui/react/macro"
import * as AsyncResult from "effect/unstable/reactivity/AsyncResult"
import { useAtomValue } from "@effect/atom-react"
import { ApiClient } from "@/shared/api-client"
import { Breadcrumb } from "@/shared/components/breadcrumb"

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
const PlayerIdParamSchema = Schema.NonEmptyString.pipe(
  Schema.decodeTo(
    Schema.NullOr(Schema.Number),
    SchemaTransformation.transform({
      decode: (input) => {
        const match = input.match(playerIdRegex)
        const parsed = match?.[1]
        if (!parsed) return null

        try {
          return Number.parseInt(parsed, 10)
        } catch {
          return null
        }
      },
      encode: (input) => (input ?? "").toString(),
    }),
  ),
)

const ParamsSchema = Schema.Struct({
  playerId: PlayerIdParamSchema,
})

const decodeParams = Schema.decodePromise(ParamsSchema)

export const Route = createFileRoute(
  "/{-$locale}/_sidebar-layout/brawlhalla/players/$playerId/{-$tab}",
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
    ApiClient.query("brawlhalla", "get-player-by-id", {
      params: { id: playerId },
      reactivityKeys: ["brawlhalla-player-id", playerId],
    }),
  )

  return AsyncResult.builder(playerDataResult)
    .onInitialOrWaiting(() => {
      return <div className="flex flex-col gap-2 px-8 pt-4">Loading...</div>
    })
    .onSuccess(({ data: playerData }) => {
      const selectedTabIndex = pathname
        .split("/")
        .findIndex((part) => part.startsWith(playerId.toString()))
      const selectedTab =
        pathname.split("/")[selectedTabIndex + 1] || "overview"

      const { name, ranked } = playerData
      const { "2v2": ranked2v2 } = ranked ?? {}
      const has2v2 = (ranked2v2?.teams.length ?? 0) > 0

      return (
        <>
          <SEO
            title={`${name} - Player Stats • dair.gg`}
            description={`${name} - Brawlhalla player stats on dair.gg`}
          />
          <Breadcrumb>
            <div className="mt-2">
              <div className="flex items-center gap-2 text-xs uppercase text-text-muted">
                <span>brawlhalla</span>
                <span>/</span>
                <span>
                  <Trans>players</Trans>
                </span>
                <span>/</span>
                <span>#{playerData.id}</span>
              </div>
            </div>
          </Breadcrumb>
          <div className="flex flex-col gap-2 px-4 pt-4">
            <PlayerHeader player={playerData} />
            <nav>
              <ul className="flex overflow-x-auto">
                <li>
                  <Tab
                    active={selectedTab === "overview"}
                    to="/brawlhalla/players/$playerId/overview"
                    params={{ playerId: playerData.slug }}
                  >
                    <Trans>Overview</Trans>
                  </Tab>
                </li>
                {has2v2 ? (
                  <li>
                    <Tab
                      active={selectedTab === "2v2"}
                      to="/brawlhalla/players/$playerId/2v2"
                      params={{ playerId: playerData.slug }}
                    >
                      <Trans>2v2</Trans>
                    </Tab>
                  </li>
                ) : null}
                <li>
                  <Tab
                    active={selectedTab === "legends"}
                    to="/brawlhalla/players/$playerId/legends"
                    params={{ playerId: playerData.slug }}
                  >
                    <Trans>Legends</Trans>
                  </Tab>
                </li>
                <li>
                  <Tab
                    active={selectedTab === "weapons"}
                    to="/brawlhalla/players/$playerId/weapons"
                    params={{ playerId: playerData.slug }}
                  >
                    <Trans>Weapons</Trans>
                  </Tab>
                </li>
              </ul>
            </nav>
          </div>
          <div className="@container p-4">
            {selectedTab === "overview" && (
              <PlayerOverviewTab playerData={playerData} />
            )}
            {selectedTab === "2v2" && ranked ? (
              <PlayerTeamsTab playerName={name} ranked={ranked} />
            ) : null}
            {selectedTab === "legends" && (
              <PlayerLegendsTab
                legends={playerData.legends}
                matchtime={playerData.stats.matchtime}
                games={playerData.stats.games}
              />
            )}
            {selectedTab === "weapons" && (
              <PlayerWeaponsTab
                weapons={playerData.weapons}
                matchtime={playerData.stats.matchtime}
                games={playerData.stats.games}
              />
            )}
          </div>
        </>
      )
    })
    .onFailure(() => {
      return (
        <div className="px-8 pt-4">
          <Trans>Could not load this player.</Trans>
        </div>
      )
    })
    .render()
}
