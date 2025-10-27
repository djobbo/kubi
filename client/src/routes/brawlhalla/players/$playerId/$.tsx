import { createFileRoute } from "@tanstack/react-router";
import { Route as PlayerRoute } from "./route";
import { Button, Card, ProgressBar, StatsGrid } from "./-components";
import { t } from "@lingui/core/macro";
import { cn } from "@/ui/lib/utils";
import { Cell, LabelList, Pie, PieChart } from "recharts";
import { RankedTierBanner } from "@/features/brawlhalla/components/Image";

export const Route = createFileRoute("/brawlhalla/players/$playerId/$")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: playerData } = PlayerRoute.useLoaderData();
  const { stats, ranked } = playerData;

  const { "1v1": ranked1v1, "2v2": ranked2v2 } = ranked ?? {};
  const bestTeam = ranked2v2?.teams[0];

  const gamesPieData = [
    {
      name: t`W`,
      value: stats.wins,
    },
    {
      name: t`L`,
      value: stats.games - stats.wins,
    },
  ];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {!!ranked1v1 && (
          <Card className="flex flex-col gap-4">
            <h3 className="text-sm uppercase text-text-muted font-semibold">
              Ranked 1v1
            </h3>
            <div className="flex gap-2">
              <RankedTierBanner
                tier={ranked1v1.tier}
                alt={ranked1v1.tier ?? ""}
                containerClassName="h-24 w-16"
                className="object-contain object-center [grid-area:banner]"
              />
              <div className="flex flex-1 flex-col gap-1">
                <span>{ranked1v1.tier}</span>
                <span className="text-4xl font-bold">
                  {ranked1v1.rating}
                  <span className="text-sm text-text-muted font-normal ml-1">
                    / {ranked1v1.peak_rating} peak
                  </span>
                </span>
                <ProgressBar value={50} max={100} intent="success" />
                <div className="flex justify-between">
                  <span>
                    {ranked1v1.wins}W{" "}
                    <span className="text-text-muted font-normal text-sm">
                      {((ranked1v1.wins / ranked1v1.games) * 100).toFixed(2)}%)
                    </span>
                  </span>
                  <span>
                    {ranked1v1.games - ranked1v1.wins}L{" "}
                    <span className="text-text-muted font-normal text-sm">
                      {(
                        ((ranked1v1.games - ranked1v1.wins) / ranked1v1.games) *
                        100
                      ).toFixed(2)}
                      %)
                    </span>
                  </span>
                </div>
              </div>
            </div>
            <Card variant="inset" className="@container mt-4">
              <StatsGrid
                stats={[
                  {
                    title: t`Games`,
                    value: ranked1v1.games.toLocaleString(),
                  },
                  {
                    title: t`Elo reset`,
                    value: ranked1v1.rating_reset,
                  },
                ]}
              />
            </Card>
          </Card>
        )}
        {!!ranked2v2 && !!bestTeam && (
          <Card className="flex flex-col gap-4">
            <h3 className="text-sm uppercase text-text-muted font-semibold">
              Ranked 2v2
            </h3>
            <div className="flex gap-2">
              <RankedTierBanner
                tier={bestTeam.tier}
                alt={bestTeam.tier ?? ""}
                containerClassName="h-24 w-16"
                className="object-contain object-center [grid-area:banner]"
              />
              <div className="flex flex-1 flex-col gap-1">
                <span>{bestTeam.tier}</span>
                <span className="text-4xl font-bold">
                  {bestTeam.rating}
                  <span className="text-sm text-text-muted font-normal ml-1">
                    / {bestTeam.peak_rating} peak
                  </span>
                </span>
                <ProgressBar value={50} max={100} intent="success" />
                <div className="flex justify-between">
                  <span>
                    {bestTeam.wins}W{" "}
                    <span className="text-text-muted font-normal text-sm">
                      {((bestTeam.wins / bestTeam.games) * 100).toFixed(2)}%)
                    </span>
                  </span>
                  <span>
                    {bestTeam.games - bestTeam.wins}L{" "}
                    <span className="text-text-muted font-normal text-sm">
                      {(
                        ((bestTeam.games - bestTeam.wins) / bestTeam.games) *
                        100
                      ).toFixed(2)}
                      %)
                    </span>
                  </span>
                </div>
              </div>
            </div>
            <Card variant="inset" className="@container mt-4">
              <StatsGrid
                stats={[
                  {
                    title: t`Games`,
                    value: bestTeam.games.toLocaleString(),
                  },
                  {
                    title: t`Teammates`,
                    value: ranked2v2.teams.length.toLocaleString(),
                  }
                ]}
              />
            </Card>
          </Card>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        <Card>
          <h3 className="text-sm uppercase text-text-muted font-semibold">
            Games
          </h3>
          <div
            className="grid place-items-center"
            style={{ gridTemplateAreas: '"content"' }}
          >
            <div className="[grid-area:content] flex flex-col items-center">
              <span className="text-3xl font-bold">{stats.games.toLocaleString()}</span>
              <span className="text-sm text-text-muted font-normal ml-1">
                {t`Games`}
              </span>
            </div>
            <PieChart
              className="[grid-area:content] w-full h-full max-h-56 aspect-square"
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
                className="fill-success"
                isAnimationActive={false}
              >
                <LabelList
                  position="outside"
                  offset={12}
                  valueAccessor={(_, i) => {
                    const data = gamesPieData[i];
                    return `${data.value}${data.name}`;
                  }}
                  className="fill-text-muted"
                />
                <LabelList
                  position="insideEnd"
                  offset={4}
                  valueAccessor={(_, i) => {
                    const data = gamesPieData[i];
                    return `${(
                      (data.value /
                        gamesPieData.reduce(
                          (acc, curr) => acc + curr.value,
                          0
                        )) *
                      100
                    ).toFixed(2)}%`;
                  }}
                  className="fill-bg"
                />
                {gamesPieData.map((_entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    className={cn("stroke-none fill-success", {
                      "fill-danger": index === 1,
                    })}
                  />
                ))}
              </Pie>
            </PieChart>
          </div>
        </Card>
        <Card>
          <h3 className="text-sm uppercase text-text-muted font-semibold">
            KOs
          </h3>
          <div className="flex flex-col gap-2 justify-between items-center mt-4">
            {(
              [
                {
                  title: t`KOs`,
                  value: stats.kos,
                  // TODO: Refactor this to compute this only once
                  max: Math.max(stats.kos, stats.falls, stats.suicides, stats.team_kos),
                  large: true,
                },
                {
                  title: t`Falls`,
                  value: stats.falls,
                  max: Math.max(stats.kos, stats.falls, stats.suicides, stats.team_kos),
                  large: true,
                },
                {
                  title: t`Suicides`,
                  value: stats.suicides,
                  max: Math.max(stats.kos, stats.falls, stats.suicides, stats.team_kos),
                  large: false,
                },
                {
                  title: t`Team KOs`,
                  value: stats.team_kos,
                  max: Math.max(stats.kos, stats.falls, stats.suicides, stats.team_kos),
                  large: false,
                },
              ] as const
            ).map((stat) => {
              return (
                <div key={stat.title} className="w-full">
                  <p>
                    <span
                      className={cn("text-sm", {
                        "text-lg": stat.large,
                      })}
                    >
                      {stat.value.toLocaleString()}{" "}
                      <span className="text-sm text-text-muted">
                        {stat.title}
                      </span>
                    </span>
                  </p>
                  <ProgressBar value={stat.value} max={stat.max} size="sm" />
                </div>
              );
            })}
          </div>
        </Card>
        <Card className="flex flex-col gap-4">
          <h3 className="text-sm uppercase text-text-muted font-semibold">
            Damage
          </h3>
          <div className="flex flex-col gap-2 flex-1">
            {(
              [
                {
                  title: t`Damage dealt`,
                  value: stats.damage_dealt,
                  max: Math.max(stats.damage_dealt, stats.damage_taken),
                },
                {
                  title: t`Damage taken`,
                  value: stats.damage_taken,
                  max: Math.max(stats.damage_dealt, stats.damage_taken),
                },
              ] as const
            ).map((stat) => {
              return (
                <div key={stat.title} className="w-full">
                  <p>
                    <span className="text-lg">
                      {stat.value.toLocaleString()}{" "}
                      <span className="text-sm text-text-muted">
                        {stat.title}
                      </span>
                    </span>
                  </p>
                  <ProgressBar value={stat.value} max={stat.max} size="sm" />
                </div>
              );
            })}
          </div>
          <Card variant="inset" className="@container mt-4">
            <StatsGrid
              stats={[
                {
                  title: t`Damage dealt per second`,
                  value: `${(stats.damage_dealt / stats.matchtime).toFixed(1)} dmg/s`,
                  description: t`Damage dealt per second`,
                },
                {
                  title: t`Damage taken per second`,
                  value: `${(stats.damage_taken / stats.matchtime).toFixed(1)} dmg/s`,
                  description: t`Damage taken per second`,
                },
              ]}
            />
          </Card>
        </Card>
      </div>
      <StatsGrid
        stats={[
          {
            title: t`Time between each KO`,
            value: `${(stats.matchtime / stats.kos).toFixed(1)}s/KO`,
            description: t`Time between each KO`,
          },
          {
            title: t`Time between each fall`,
            value: `${(stats.matchtime / stats.falls).toFixed(1)}s/fall`,
            description: t`Time between each fall`,
          },
          {
            title: t`Average KOs per game`,
            value: (stats.kos / stats.games).toFixed(1),
            description: t`Average KOs per game`,
          },
          {
            title: t`Average falls per game`,
            value: (stats.falls / stats.games).toFixed(1),
            description: t`Average falls per game`,
          },
          {
            title: t`Average games between each suicide`,
            value: `${(stats.games / stats.suicides).toFixed(1)} games`,
            description: t`Average games between each suicide`,
          },
          {
            title: t`Average games between each Team KO`,
            value: `${(stats.games / stats.team_kos).toFixed(1)} games`,
            description: t`Average games between each Team KO`,
          },
          {
            title: t`Average damage dealt per game`,
            value: (stats.damage_dealt / stats.games).toFixed(1),
            description: t`Average damage dealt per game`,
          },
          {
            title: t`Average damage taken per game`,
            value: (stats.damage_taken / stats.games).toFixed(1),
            description: t`Average damage taken per game`,
          },
          {
            title: t`Average game length`,
            value: `${(stats.matchtime / stats.games).toFixed(1)}s`,
            description: t`Average game length in seconds`,
          },
        ]}
        className="mt-4 p-4"
      />
      <Card className="flex flex-col gap-4">
        <hr className="border-border" />
        <p className="text-sm text-text-muted">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </p>
        <div className="flex gap-2 justify-end flex-wrap">
          <Button>Primary</Button>
          <Button intent="secondary">Secondary</Button>
        </div>
      </Card>
    </>
  );
}
