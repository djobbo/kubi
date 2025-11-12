import { SEO } from "@dair/common/src/helpers/seo";
import {
  createFileRoute,
  notFound,
  useLocation,
} from "@tanstack/react-router";
import { Outlet } from "@tanstack/react-router";
import { Schema } from "effect";
import { Card, StatsGrid, Tab } from "./-components";
import { formatTime } from "@dair/common/src/helpers/date";
import { AtomHttpApi, Result, useAtomValue } from "@effect-atom/atom-react";
import { Api } from "@dair/effect-ts/src/api";
import { FetchHttpClient } from "@effect/platform";
import { env } from "@/env";
import { sidebarExpandedAtom } from "@/routes/_sidenav/route";
import { cn } from "@/ui/lib/utils";

export class ApiClient extends AtomHttpApi.Tag<ApiClient>()("ApiClient", {
  api: Api,
  // Provide a Layer that provides the HttpClient
  httpClient: FetchHttpClient.layer,
  baseUrl: env.VITE_API_URL,
}) {}

const playerIdRegex = /(^\d+).*/;
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
      const match = input.match(playerIdRegex);
      const parsed = match?.[1];
      if (!parsed) return null;

      try {
        return parseInt(parsed, 10);
      } catch (error) {
        return null;
      }
    },
    encode: (input) => (input ?? "").toString(),
  }
);

const ParamsSchema = Schema.Struct({
  playerId: PlayerIdParamSchema,
});

const decodeParams = Schema.decodePromise(ParamsSchema);

export const Route = createFileRoute("/_sidenav/brawlhalla/players/$playerId")({
  component: RouteComponent,
  async loader({ params }) {
    const { playerId } = await decodeParams(params);

    if (!playerId) {
      throw notFound();
    }

    return {
      playerId,
    };
  },
  staleTime: 5 * 60 * 1000,
});

function RouteComponent() {
  const { playerId } = Route.useLoaderData();
  const { pathname } = useLocation();
  const sidebarExpanded = useAtomValue(sidebarExpandedAtom);
  const playerDataResult = useAtomValue(
    ApiClient.query("brawlhalla", "get-player-by-id", {
      path: { id: playerId },
      reactivityKeys: ["brawlhalla-player-id", playerId],
    })
  );

  return Result.builder(playerDataResult)
    .onInitialOrWaiting(() => {
      return <div className="px-8 pt-4 flex flex-col gap-2">Loading...</div>;
    })
    .onSuccess(({ data: playerData }) => {
      const selectedTabIndex = pathname
        .split("/")
        .findIndex((part) => part.startsWith(playerId.toString()));
      const selectedTab =
        pathname.split("/")[selectedTabIndex + 1] || "overview";

      const { name, aliases, stats } = playerData;

      return (
        <>
          <SEO
            title={`${name} - Player Stats • Corehalla`}
            description={`${name} - Brawlhalla Player Stats • Corehalla`}
          />
          <div className="px-4 pt-4 flex flex-col gap-2">
            <div
              className={cn("transition-all mt-2", {
                "pl-2": sidebarExpanded,
                "pl-10": !sidebarExpanded,
              })}
            >
              <div className="flex items-center gap-2 uppercase text-text-muted text-xs">
                <span>brawlhalla</span>
                {"/"}
                <span>players</span>
                {"/"}
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
              <StatsGrid
                stats={[
                  {
                    title: "Account level",
                    value: stats.level,
                  },
                  {
                    title: "Account XP",
                    value: stats.xp.toLocaleString(),
                  },
                  {
                    title: "In-game time",
                    value: formatTime(stats.matchtime),
                  },
                ]}
              />
            </Card>
            <nav>
              <ul className="flex">
                <li>
                  <Tab
                    active={selectedTab === "overview"}
                    to="/brawlhalla/players/$playerId/overview"
                    params={{ playerId: playerData.slug }}
                  >
                    Overview
                  </Tab>
                </li>
                <li>
                  <Tab
                    active={selectedTab === "2v2"}
                    to="/brawlhalla/players/$playerId/2v2"
                    params={{ playerId: playerData.slug }}
                  >
                    2v2
                  </Tab>
                </li>
                <li>
                  <Tab
                    active={selectedTab === "legends"}
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
            <Outlet />
          </div>
        </>
      );
    })
    .onFailure((error) => {
      return (
        <div className="px-8 pt-4">
          Error {";)"} <pre>{error.toString()}</pre>
          <pre>{JSON.stringify(error, null, 2)}</pre>
        </div>
      );
    })
    .render();
}
