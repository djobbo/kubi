import { RankedTierBanner } from "@/shared/components/image";
import { Card } from "@/shared/components/card";
import { Progress } from "@/shared/components/progress";
import { StatGrid } from "@/shared/components/stat-grid";
import { calculateWinrate } from "@dair/brawlhalla-api";
import type { Player } from "@dair/api-contract/src/routes/v1/brawlhalla/get-player-by-id";
import type { TierName } from "@dair/api-contract/src/shared/tier";
import { formatTime } from "@dair/common/src/helpers/date";
import { cn } from "@dair/common/src/helpers/ui";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { Cell, LabelList, Pie, PieChart } from "recharts";

type PlayerOverviewTabProps = {
  playerData: typeof Player.Type;
};

export const PlayerOverviewTab = ({ playerData }: PlayerOverviewTabProps) => {
  const { stats, ranked, clan, unarmed, weapon_throws, gadgets } = playerData;
  const { "1v1": ranked1v1, "2v2": ranked2v2 } = ranked ?? {};
  const bestTeam = ranked2v2?.teams[0];
  const hasEnoughGames = (ranked?.stats.games ?? 0) >= 10;

  const gamesPieData = [
    { name: t`W`, value: stats.wins },
    { name: t`L`, value: stats.games - stats.wins },
  ];

  const koMax = Math.max(stats.kos, stats.falls, stats.suicides, stats.team_kos);
  const damageMax = Math.max(stats.damage_dealt, stats.damage_taken);

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {ranked1v1 ? (
          <Card className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold uppercase text-text-muted">
              <Trans>Ranked 1v1</Trans>
            </h3>
            <div className="flex gap-2">
              <RankedTierBanner
                tier={ranked1v1.tier as TierName}
                alt={ranked1v1.tier ?? ""}
                containerClassName="h-24 w-18"
                className="object-contain object-center"
              />
              <div className="flex flex-1 flex-col gap-1">
                <span>{ranked1v1.tier}</span>
                <span className="text-4xl font-bold">
                  {ranked1v1.rating}
                  <span className="ml-1 text-sm font-normal text-text-muted">
                    / {ranked1v1.peak_rating} peak
                  </span>
                </span>
                <Progress value={ranked1v1.wins / ranked1v1.games} max={1} intent="success" />
                <div className="flex justify-between">
                  <span>
                    {ranked1v1.wins}W{" "}
                    <span className="text-sm font-normal text-text-muted">
                      ({((ranked1v1.wins / ranked1v1.games) * 100).toFixed(2)}%)
                    </span>
                  </span>
                  <span>
                    {ranked1v1.games - ranked1v1.wins}L{" "}
                    <span className="text-sm font-normal text-text-muted">
                      ({(((ranked1v1.games - ranked1v1.wins) / ranked1v1.games) * 100).toFixed(2)}
                      %)
                    </span>
                  </span>
                </div>
              </div>
            </div>
            <Card variant="inset" className="@container">
              <StatGrid
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
        ) : (
          <Card variant="dashed" className="grid place-items-center text-text-muted">
            <Trans>No ranked 1v1 data available</Trans>
          </Card>
        )}
        {ranked2v2 && bestTeam ? (
          <Card className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold uppercase text-text-muted">
              <Trans>Ranked 2v2</Trans>
            </h3>
            <div className="flex gap-2">
              <RankedTierBanner
                tier={bestTeam.tier as TierName}
                alt={bestTeam.tier ?? ""}
                containerClassName="h-24 w-18"
                className="object-contain object-center"
              />
              <div className="flex flex-1 flex-col gap-1">
                <span>{bestTeam.tier}</span>
                <span className="text-4xl font-bold">
                  {bestTeam.rating}
                  <span className="ml-1 text-sm font-normal text-text-muted">
                    / {bestTeam.peak_rating} peak
                  </span>
                </span>
                <Progress value={bestTeam.wins / bestTeam.games} max={1} intent="success" />
                <div className="flex justify-between">
                  <span>
                    {bestTeam.wins}W{" "}
                    <span className="text-sm font-normal text-text-muted">
                      ({((bestTeam.wins / bestTeam.games) * 100).toFixed(2)}%)
                    </span>
                  </span>
                  <span>
                    {bestTeam.games - bestTeam.wins}L{" "}
                    <span className="text-sm font-normal text-text-muted">
                      ({(((bestTeam.games - bestTeam.wins) / bestTeam.games) * 100).toFixed(2)}
                      %)
                    </span>
                  </span>
                </div>
              </div>
            </div>
            <Card variant="inset" className="@container">
              <StatGrid
                stats={[
                  {
                    title: t`Games`,
                    value: bestTeam.games.toLocaleString(),
                  },
                  {
                    title: t`Teammates`,
                    value: ranked2v2.teams.length.toLocaleString(),
                  },
                ]}
              />
            </Card>
          </Card>
        ) : (
          <Card variant="dashed" className="grid place-items-center text-text-muted">
            <Trans>No ranked 2v2 data available</Trans>
          </Card>
        )}
      </div>

      {ranked && ranked1v1 ? (
        <StatGrid
          className="mt-4"
          stats={[
            {
              title: t`Season winrate`,
              value: `${calculateWinrate(ranked.stats.wins, ranked.stats.games).toFixed(2)}%`,
            },
            ...(hasEnoughGames
              ? [
                  {
                    title: t`Total glory`,
                    value: ranked.stats.glory.total.toLocaleString(),
                  },
                  {
                    title: t`Glory from rating`,
                    value: ranked.stats.glory.from_peak_rating.toLocaleString(),
                  },
                  {
                    title: t`Glory from wins`,
                    value: ranked.stats.glory.from_wins.toLocaleString(),
                  },
                ]
              : [
                  {
                    title: t`Total glory`,
                    value: t`N/A (not enough games)`,
                  },
                ]),
          ]}
        />
      ) : null}

      {clan ? (
        <Card className="mt-4 flex flex-col gap-4">
          <h3 className="text-sm font-semibold uppercase text-text-muted">
            <Trans>Clan</Trans>
          </h3>
          <p className="text-3xl font-bold">{clan.name}</p>
          <span className="text-xs font-bold text-text-muted">#{clan.id}</span>
          <StatGrid
            stats={[
              {
                title: t`Clan XP`,
                value: clan.xp.toLocaleString(),
              },
              {
                title: t`Contribution`,
                value: `${((clan.personal_xp / clan.xp) * 100).toFixed(2)}%`,
              },
            ]}
          />
        </Card>
      ) : null}

      <div className="mt-4">
        <h3 className="mb-4 text-sm font-semibold uppercase text-text-muted">
          <Trans>General stats</Trans>
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <h3 className="text-sm font-semibold uppercase text-text-muted">
              <Trans>Games</Trans>
            </h3>
            <div className="grid place-items-center" style={{ gridTemplateAreas: '"content"' }}>
              <div className="[grid-area:content] flex flex-col items-center">
                <span className="text-3xl font-bold">{stats.games.toLocaleString()}</span>
                <span className="text-sm text-text-muted">{t`Games`}</span>
              </div>
              <PieChart
                className="[grid-area:content] aspect-square h-full max-h-56 w-full"
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
                  <LabelList
                    position="outside"
                    offset={12}
                    valueAccessor={(_, i) => {
                      const data = gamesPieData[i]!;
                      return `${data.value}${data.name}`;
                    }}
                    className="fill-text-muted"
                  />
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
          <Card>
            <h3 className="text-sm font-semibold uppercase text-text-muted">
              <Trans>KOs</Trans>
            </h3>
            <div className="mt-4 flex flex-col items-center justify-between gap-2">
              {(
                [
                  { title: t`KOs`, value: stats.kos, large: true },
                  { title: t`Falls`, value: stats.falls, large: true },
                  { title: t`Suicides`, value: stats.suicides, large: false },
                  { title: t`Team KOs`, value: stats.team_kos, large: false },
                ] as const
              ).map((item) => (
                <div key={item.title} className="w-full">
                  <p>
                    <span className={cn("text-sm", { "text-lg": item.large })}>
                      {item.value.toLocaleString()}{" "}
                      <span className="text-sm text-text-muted">{item.title}</span>
                    </span>
                  </p>
                  <Progress value={item.value} max={koMax} size="sm" />
                </div>
              ))}
            </div>
          </Card>
          <Card className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold uppercase text-text-muted">
              <Trans>Damage</Trans>
            </h3>
            <div className="flex flex-1 flex-col gap-2">
              {(
                [
                  { title: t`Damage dealt`, value: stats.damage_dealt },
                  { title: t`Damage taken`, value: stats.damage_taken },
                ] as const
              ).map((item) => (
                <div key={item.title} className="w-full">
                  <p>
                    <span className="text-lg">
                      {item.value.toLocaleString()}{" "}
                      <span className="text-sm text-text-muted">{item.title}</span>
                    </span>
                  </p>
                  <Progress value={item.value} max={damageMax} size="sm" />
                </div>
              ))}
            </div>
            <Card variant="inset" className="@container">
              <StatGrid
                stats={[
                  {
                    title: t`Damage dealt per second`,
                    value: `${(stats.damage_dealt / stats.matchtime).toFixed(1)} dmg/s`,
                  },
                  {
                    title: t`Damage taken per second`,
                    value: `${(stats.damage_taken / stats.matchtime).toFixed(1)} dmg/s`,
                  },
                ]}
              />
            </Card>
          </Card>
        </div>
        <StatGrid
          className="mt-4"
          stats={[
            {
              title: t`Time between each KO`,
              value: `${(stats.matchtime / stats.kos).toFixed(1)}s/KO`,
            },
            {
              title: t`Time between each fall`,
              value: `${(stats.matchtime / stats.falls).toFixed(1)}s/fall`,
            },
            {
              title: t`Average KOs per game`,
              value: (stats.kos / stats.games).toFixed(1),
            },
            {
              title: t`Average falls per game`,
              value: (stats.falls / stats.games).toFixed(1),
            },
            {
              title: t`Average games between each suicide`,
              value: `${(stats.games / stats.suicides).toFixed(1)} games`,
            },
            {
              title: t`Average games between each Team KO`,
              value: `${(stats.games / stats.team_kos).toFixed(1)} games`,
            },
            {
              title: t`Average damage dealt per game`,
              value: (stats.damage_dealt / stats.games).toFixed(1),
            },
            {
              title: t`Average damage taken per game`,
              value: (stats.damage_taken / stats.games).toFixed(1),
            },
            {
              title: t`Average game length`,
              value: `${(stats.matchtime / stats.games).toFixed(1)}s`,
            },
          ]}
        />
      </div>

      <Card className="mt-4">
        <h3 className="mb-4 text-sm font-semibold uppercase text-text-muted">
          <Trans>Unarmed</Trans>
        </h3>
        <StatGrid
          stats={[
            {
              title: t`Time unarmed`,
              value: formatTime(unarmed.time_held),
            },
            {
              title: t`Time unarmed (%)`,
              value: `${((unarmed.time_held / stats.matchtime) * 100).toFixed(2)}%`,
            },
            { title: t`KOs`, value: unarmed.kos.toLocaleString() },
            {
              title: t`Avg. KOs per game`,
              value: (unarmed.kos / stats.games).toFixed(2),
            },
            {
              title: t`Damage dealt`,
              value: unarmed.damage_dealt.toLocaleString(),
            },
            {
              title: t`DPS`,
              value: `${(unarmed.damage_dealt / unarmed.time_held).toFixed(2)} dmg/s`,
            },
          ]}
        />
      </Card>

      <Card className="mt-4">
        <h3 className="mb-4 text-sm font-semibold uppercase text-text-muted">
          <Trans>Weapon throws</Trans>
        </h3>
        <StatGrid
          stats={[
            { title: t`KOs`, value: weapon_throws.kos.toLocaleString() },
            {
              title: t`1 KO every`,
              value: `${(stats.games / weapon_throws.kos).toFixed(1)} games`,
            },
            {
              title: t`Damage dealt`,
              value: weapon_throws.damage_dealt.toLocaleString(),
            },
            {
              title: t`Avg. dmg dealt per game`,
              value: (weapon_throws.damage_dealt / stats.games).toFixed(2),
            },
          ]}
        />
      </Card>

      <Card className="mt-4">
        <h3 className="mb-4 text-sm font-semibold uppercase text-text-muted">
          <Trans>Gadgets</Trans>
        </h3>
        <StatGrid
          stats={[
            { title: t`KOs`, value: gadgets.kos.toLocaleString() },
            {
              title: t`1 KO every`,
              value: `${(stats.games / gadgets.kos).toFixed(1)} games`,
            },
            {
              title: t`Damage dealt`,
              value: gadgets.damage_dealt.toLocaleString(),
            },
            {
              title: t`Avg. dmg dealt per game`,
              value: (gadgets.damage_dealt / stats.games).toFixed(2),
            },
            ...(gadgets.bomb
              ? [
                  {
                    title: t`Bomb KOs`,
                    value: gadgets.bomb.kos.toLocaleString(),
                  },
                ]
              : []),
            ...(gadgets.mine
              ? [
                  {
                    title: t`Mine KOs`,
                    value: gadgets.mine.kos.toLocaleString(),
                  },
                ]
              : []),
          ]}
        />
      </Card>
    </>
  );
};
