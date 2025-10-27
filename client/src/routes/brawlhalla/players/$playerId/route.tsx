import { sluggify } from "@/helpers/sluggify";
import { seo } from "@dair/common/src/helpers/seo";
import { t } from "@lingui/core/macro";
import { createFileRoute, Link, useLocation } from "@tanstack/react-router";
import { Outlet } from "@tanstack/react-router";
import { Effect, Schema } from "effect";
import { Card, StatsGrid, Tab } from "./-components";
import { formatTime } from "@dair/common/src/helpers/date";

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
      if (!match) return null;

      const parsed = parseInt(match[1], 10);
      if (isNaN(parsed)) return null;

      return parsed;
    },
    encode: (input) => input?.toString() ?? "",
  }
);

const ParamsSchema = Schema.Struct({
  playerId: PlayerIdParamSchema,
});

export const Route = createFileRoute("/brawlhalla/players/$playerId")({
  component: RouteComponent,
  loader: ({ params, location, context: { ApiClient } }) =>
    Effect.runPromise(
      Effect.gen(function* () {
        const { playerId } = yield* Schema.decodeUnknown(ParamsSchema)(params);

        if (!playerId) {
          return yield* Effect.fail(new Error("Player ID is required"));
        }

        const playerData = yield* ApiClient.brawlhalla["get-player-by-id"]({
          path: { id: playerId },
        });

        return {
          playerId: `${playerId}-${sluggify(playerData.data.name).slice(
            0,
            24
          )}`,
          ...playerData,
        };
      })
    ),
  staleTime: 5 * 60 * 1000,
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const {
      data: { name },
    } = loaderData;

    return {
      meta: seo({
        title: t`${name} - Player Stats • Corehalla`,
        description: t`${name} Stats - Brawlhalla Player Stats • Corehalla`,
      }),
    };
  },
});

function RouteComponent() {
  const { playerId, data: playerData } = Route.useLoaderData();
  const { pathname } = useLocation();

  const selectedTabIndex = location.pathname
    .split("/")
    .findIndex((part) => part.startsWith(playerId.toString()));
  const selectedTab = pathname.split("/")[selectedTabIndex + 1] || "overview";

  const { name, aliases, stats } = playerData;

  return (
    <div className="[grid-area:main] pr-1 pb-1 rounded-tl-2xl">
      <div className="rounded-xl h-full bg-bg border border-border">
        <div className="px-8 pt-4 flex flex-col gap-2">
          <div>
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
              className="w-6 h-6 rounded-lg border border-border"
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
                <Link
                  to="/brawlhalla/players/$playerId/overview"
                  params={{ playerId }}
                >
                  <Tab active={selectedTab === "overview"}>Overview</Tab>
                </Link>
              </li>
              <li>
                <Link
                  to="/brawlhalla/players/$playerId/2v2"
                  params={{ playerId }}
                >
                  <Tab active={selectedTab === "2v2"}>2v2</Tab>
                </Link>
              </li>
              <li>
                <Link
                  to="/brawlhalla/players/$playerId/legends"
                  params={{ playerId }}
                >
                  <Tab active={selectedTab === "legends"}>Legends</Tab>
                </Link>
              </li>
            </ul>
          </nav>
        </div>
        <div className="@container p-4 bg-bg-dark">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
