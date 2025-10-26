import { Card, CardContent, CardHeader, CardTitle } from "@/ui/components/card"
import { type ChartConfig, ChartContainer } from "@/ui/components/chart"
import { Progress } from "@/ui/components/progress"
import { calculateWinrate } from "@dair/brawlhalla-api/src/helpers/winrate"
import { formatTime } from "@dair/common/src/helpers/date"
import { t } from "@lingui/core/macro"
import { createFileRoute } from "@tanstack/react-router"
import { Link } from "@tanstack/react-router"
import {
	BarChartIcon,
	BombIcon,
	HandIcon,
	ShieldIcon,
	SwordIcon,
	TrophyIcon,
	UsersIcon,
} from "lucide-react"
import { Area, AreaChart, XAxis, YAxis } from "recharts"
import { Route as PlayerRoute } from "./$playerId"
import { RankedDisplay } from "./-ranked-display"
import { StatsGrid } from "./-stats-grid"
import { WinrateProgress } from "./-winrate-progress"

export const Route = createFileRoute("/_sidenav-layout/players/$playerId/$")({
	component: RouteComponent,
})

type Ranked1v1CardProps = {
	ranked: ReturnType<typeof PlayerRoute.useLoaderData>["data"]["ranked"]
}

function Ranked1v1Card({ ranked }: Ranked1v1CardProps) {
	if (!ranked?.['1v1']) return null

	const ranked1v1 = ranked["1v1"]
	const winrate = calculateWinrate(ranked1v1.wins, ranked1v1.games)

	const TEST_rankedEvolution = [
		{ timestamp: 1704067200000, rating: 2000 },
		{ timestamp: 1706659200000, rating: 1982 },
		{ timestamp: 1709251200000, rating: 1817 },
		{ timestamp: 1711843200000, rating: 2003 },
		{ timestamp: 1714435200000, rating: 1999 },
		{ timestamp: 1717046400000, rating: 2174 },
	]

	const TEST_chartConfig = {
		rating: {
			label: "Rating",
			color: "var(--chart-1)",
		},
		peak_rating: {
			label: "Peak Rating",
			color: "var(--chart-2)",
		},
	} satisfies ChartConfig

	return (
		<Card className="h-full">
			<CardHeader>
				<CardTitle className="flex items-center justify-between gap-2 text-lg sm:text-xl">
					<span className="flex items-center gap-2">
						<TrophyIcon className="h-4 w-4 text-yellow-500 sm:h-5 sm:w-5" />
						Ranked Season
					</span>

					<ChartContainer config={TEST_chartConfig} className="w-24 h-8">
						<AreaChart
							accessibilityLayer
							data={TEST_rankedEvolution}
							margin={{
								left: 12,
								right: 12,
							}}
						>
							<XAxis
								dataKey="timestamp"
								hide
								tickLine={false}
								axisLine={false}
								tick={false}
							/>
							<YAxis
								hide
								domain={[
									Math.min(...TEST_rankedEvolution.map((item) => item.rating)) -
										100,
									Math.max(...TEST_rankedEvolution.map((item) => item.rating)) +
										100,
								]}
								dataKey="rating"
								tickLine={false}
								axisLine={false}
								tick={false}
								tickMargin={8}
								tickFormatter={(value) => value.toString()}
							/>
							<defs>
								<linearGradient id="fillRating" x1="0" y1="0" x2="0" y2="1">
									<stop
										offset="5%"
										stopColor="var(--chart-2)"
										stopOpacity={0.8}
									/>
									<stop
										offset="95%"
										stopColor="var(--chart-2)"
										stopOpacity={0.1}
									/>
								</linearGradient>
							</defs>
							<Area
								dataKey="rating"
								type="natural"
								fill="url(#fillRating)"
								fillOpacity={0.4}
								stroke="var(--chart-2)"
								animationDuration={0}
							/>
						</AreaChart>
					</ChartContainer>
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4 sm:space-y-6">
				<RankedDisplay
					tier={ranked1v1.tier}
					rating={ranked1v1.rating}
					peak_rating={ranked1v1.peak_rating}
					wins={ranked1v1.wins}
					games={ranked1v1.games}
				/>

				<div className="grid grid-cols-2 gap-3 text-xs sm:gap-4 sm:text-sm">
					<div>
						<p className="text-muted-foreground">1v1 Games</p>
						<p className="font-semibold">{ranked1v1.games.toLocaleString()}</p>
					</div>
					<div>
						<p className="text-muted-foreground">Winrate</p>
						<p className="font-semibold">{winrate.toFixed(1)}%</p>
					</div>
					{ranked.stats.games >= 10 && (
						<>
							<div>
								<p className="text-muted-foreground">Total Glory</p>
								<p className="font-semibold">
									{ranked.stats.glory.total.toLocaleString()}
								</p>
							</div>
							<div>
								<p className="text-muted-foreground">Glory from rating</p>
								<p className="font-semibold">
									{ranked.stats.glory.from_peak_rating.toLocaleString()}
								</p>
							</div>
							<div>
								<p className="text-muted-foreground">Glory from wins</p>
								<p className="font-semibold">
									{ranked.stats.glory.from_wins.toLocaleString()}
								</p>
							</div>
						</>
					)}
					<div>
						<p className="text-muted-foreground">Elo reset</p>
						<p className="font-semibold">{ranked.stats.rating_reset}</p>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}

interface ClanInfoProps {
	clan: ReturnType<typeof PlayerRoute.useLoaderData>["data"]["clan"]
}

function ClanInfoCard({ clan }: ClanInfoProps) {
	if (!clan) return null

	const contribution = calculateWinrate(clan.personal_xp, clan.xp)

	return (
		<Card className="h-full">
			<CardHeader className="flex justify-between">
				<CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
					<ShieldIcon className="h-4 w-4 text-green-500 sm:h-5 sm:w-5" />
					<Link to={`/clans/${clan.id}`}>
						{clan.name}{" "}
						<span className="text-xs text-muted-foreground sm:text-sm">
							#{clan.id}
						</span>
					</Link>
				</CardTitle>
				<div className="text-xs uppercase text-muted-foreground font-bold">
					Clan
				</div>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-2 gap-4">
					<div>
						<p className="text-xs text-muted-foreground sm:text-sm">Clan XP</p>
						<p className="text-base font-semibold sm:text-lg">
							{clan.xp.toLocaleString()}
						</p>
					</div>
					<div>
						<p className="text-xs text-muted-foreground sm:text-sm">
							Contribution
						</p>
						<p className="text-base font-semibold sm:text-lg">
							{contribution.toFixed(1)}%
						</p>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}

interface Ranked2v2Props {
	ranked: ReturnType<typeof PlayerRoute.useLoaderData>["data"]["ranked"]
}

function Ranked2v2Card({ ranked }: Ranked2v2Props) {
	if (!ranked?.['2v2']) return null

	const teams = ranked["2v2"]?.teams ?? []
	if (teams.length === 0) return null

	const bestTeam = teams[0] ?? null
	if (!bestTeam) return null

	return (
		<Card className="h-full">
			<CardHeader className="flex justify-between">
				<CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
					<UsersIcon className="h-4 w-4 text-blue-500 sm:h-5 sm:w-5" />
					<Link to={`/players/${bestTeam.teammate.id}`}>
						{bestTeam.teammate.name}
					</Link>
				</CardTitle>
				<div className="text-xs uppercase text-muted-foreground font-bold">
					Best 2v2 Team
				</div>
			</CardHeader>
			<CardContent>
				<RankedDisplay
					tier={bestTeam.tier}
					rating={bestTeam.rating}
					peak_rating={bestTeam.peak_rating}
					wins={bestTeam.wins}
					games={bestTeam.games}
				/>
			</CardContent>
		</Card>
	)
}

interface GeneralStatsProps {
	stats: ReturnType<typeof PlayerRoute.useLoaderData>["data"]["stats"]
}

export function GeneralStatsCards({ stats }: GeneralStatsProps) {
	return (
		<div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
						<BarChartIcon className="h-4 w-4 text-blue-500 sm:h-5 sm:w-5" />
						Games
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold sm:text-3xl">
						{stats.games.toLocaleString()}
					</div>
					<WinrateProgress wins={stats.wins} games={stats.games} />
				</CardContent>
			</Card>
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
						<BarChartIcon className="h-4 w-4 text-blue-500 sm:h-5 sm:w-5" />
						KOs
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-2">
					<div>
						<div className="text-base font-semibold sm:text-lg">
							{stats.kos.toLocaleString()} KOs
						</div>
						<Progress value={75} className="h-1 mt-1" />
					</div>
					<div>
						<div className="text-base font-semibold sm:text-lg">
							{stats.falls.toLocaleString()} Falls
						</div>
						<Progress value={60} className="h-1 mt-1" />
					</div>
					<div>
						<div className="text-sm">
							{stats.suicides.toLocaleString()} Suicides
						</div>
						<Progress value={20} className="h-1 mt-1" />
					</div>
					<div>
						<div className="text-sm">
							{stats.team_kos.toLocaleString()} Team KOs
						</div>
						<Progress value={10} className="h-1 mt-1" />
					</div>
				</CardContent>
			</Card>
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
						<BarChartIcon className="h-4 w-4 text-blue-500 sm:h-5 sm:w-5" />
						Damage
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-2">
					<div>
						<div className="text-base font-semibold sm:text-lg">
							{stats.damage_dealt.toLocaleString()} Damage dealt
						</div>
						<Progress value={85} className="h-1 mt-1" />
					</div>
					<div>
						<div className="text-base font-semibold sm:text-lg">
							{stats.damage_taken.toLocaleString()} Damage taken
						</div>
						<Progress value={70} className="h-1 mt-1" />
					</div>
				</CardContent>
			</Card>
		</div>
	)
}

function RouteComponent() {
	const { data: playerData } = PlayerRoute.useLoaderData()
	const { clan, stats, ranked, unarmed, gadgets, weapon_throws } = playerData

	return (
		<div className="flex flex-col gap-4">
			<div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
				{ranked && <Ranked1v1Card ranked={ranked} />}
				<div className="flex flex-col gap-4">
					<Ranked2v2Card ranked={ranked} />
					<ClanInfoCard clan={clan} />
				</div>
			</div>
			<div>
				<h3 className="text-base font-semibold mb-3 sm:text-lg sm:mb-4">
					General Stats
				</h3>
				<GeneralStatsCards stats={stats} />
			</div>
			<div>
				<h3 className="text-base font-semibold mb-3 sm:text-lg sm:mb-4">
					Performance Stats
				</h3>
				<StatsGrid
					cards
					stats={[
						{
							name: t`Damage dealt per second`,
							value: `${(stats.damage_dealt / stats.matchtime).toFixed(1)} dmg/s`,
							desc: t`Damage dealt per second`,
						},
						{
							name: t`Damage taken per second`,
							value: `${(stats.damage_taken / stats.matchtime).toFixed(1)} dmg/s`,
							desc: t`Damage taken per second`,
						},
						{
							name: t`Time between each KO`,
							value: `${(stats.matchtime / stats.kos).toFixed(1)}s/KO`,
							desc: t`Time between each KO`,
						},
						{
							name: t`Time between each fall`,
							value: `${(stats.matchtime / stats.falls).toFixed(1)}s/fall`,
							desc: t`Time between each fall`,
						},
						{
							name: t`Average KOs per game`,
							value: (stats.kos / stats.games).toFixed(1),
							desc: t`Average KOs per game`,
						},
						{
							name: t`Average falls per game`,
							value: (stats.falls / stats.games).toFixed(1),
							desc: t`Average falls per game`,
						},
						{
							name: t`Average games between each suicide`,
							value: `${(stats.games / stats.suicides).toFixed(1)} games`,
							desc: t`Average games between each suicide`,
						},
						{
							name: t`Average games between each Team KO`,
							value: `${(stats.games / stats.team_kos).toFixed(1)} games`,
							desc: t`Average games between each Team KO`,
						},
						{
							name: t`Average damage dealt per game`,
							value: (stats.damage_dealt / stats.games).toFixed(1),
							desc: t`Average damage dealt per game`,
						},
						{
							name: t`Average damage taken per game`,
							value: (stats.damage_taken / stats.games).toFixed(1),
							desc: t`Average damage taken per game`,
						},
						{
							name: t`Average game length`,
							value: `${(stats.matchtime / stats.games).toFixed(1)}s`,
							desc: t`Average game length in seconds`,
						},
					]}
				/>
			</div>
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
						<HandIcon className="h-4 w-4 text-orange-500 sm:h-5 sm:w-5" />
						Unarmed
					</CardTitle>
				</CardHeader>
				<CardContent>
					<StatsGrid
						stats={[
							{
								name: t`Time unarmed`,
								value: `${formatTime(unarmed.time_held)}`,
								desc: t`Time played unarmed`,
							},
							{
								name: t`Time unarmed (%)`,
								value: `${((unarmed.time_held / stats.matchtime) * 100).toFixed(2)}%`,
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
								value: unarmed.damage_dealt,
								desc: t`Damage dealt unarmed`,
							},
							{
								name: t`DPS`,
								value: `${(unarmed.damage_dealt / unarmed.time_held).toFixed(2)} dmg/s`,
								desc: t`Damage dealt unarmed per second`,
							},
							{
								name: t`Avg. dmg dealt per game`,
								value: (unarmed.damage_dealt / stats.games).toFixed(2),
								desc: t`Average damage dealt unarmed per game`,
							},
						]}
					/>
				</CardContent>
			</Card>
			<div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
							<SwordIcon className="h-4 w-4 text-blue-500 sm:h-5 sm:w-5" />
							Gadgets
						</CardTitle>
					</CardHeader>
					<CardContent>
						<StatsGrid
							stats={[
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
									value: gadgets.damage_dealt,
									desc: t`Damage dealt with gadgets`,
								},
								{
									name: t`Avg. dmg dealt per game`,
									value: (gadgets.damage_dealt / stats.games).toFixed(2),
									desc: t`Average damage dealt with gadgets per game`,
								},
							]}
						/>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
							<BombIcon className="h-4 w-4 text-orange-500 sm:h-5 sm:w-5" />
							Weapon throws
						</CardTitle>
					</CardHeader>
					<CardContent>
						<StatsGrid
							stats={[
								{
									name: t`KOs`,
									value: weapon_throws.kos,
									desc: t`KOs with thrown items`,
								},
								{
									name: t`1 Ko every`,
									value: `${(stats.games / weapon_throws.kos).toFixed(1)} games`,
									desc: t`Average games between each thrown item KO`,
								},
								{
									name: t`Damage Dealt`,
									value: weapon_throws.damage_dealt,
									desc: t`Damage dealt with thrown items`,
								},
								{
									name: t`Avg. dmg dealt per game`,
									value: (weapon_throws.damage_dealt / stats.games).toFixed(2),
									desc: t`Damage dealt with thrown items per game`,
								},
							]}
						/>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
