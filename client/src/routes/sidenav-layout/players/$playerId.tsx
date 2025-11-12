import { useBookmark } from "@/features/bookmarks/hooks/use-bookmark"
import { LegendIcon, WeaponIcon } from "@/features/brawlhalla/components/Image"
import type { MiscStat } from "@/features/brawlhalla/components/stats/MiscStatGroup"
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/components/avatar"
import { Badge } from "@/ui/components/badge"
import { Button } from "@/ui/components/button"
import { ScrollArea, ScrollBar } from "@/ui/components/scroll-area"
import { Tabs, TabsList, TabsTrigger } from "@/ui/components/tabs"
import { cn } from "@/ui/lib/utils"
import { cleanString } from "@dair/common/src/helpers/clean-string"
import { formatTime } from "@dair/common/src/helpers/date"
import { seo } from "@dair/common/src/helpers/seo"
import { sluggify } from "@dair/common/src/helpers/sluggify"
import type { NewBookmark } from "@dair/schema"
import { t } from "@lingui/core/macro"
import { Outlet, createFileRoute, useNavigate } from "@tanstack/react-router"
import { Effect, Schema } from "effect"
import { BookmarkCheckIcon, BookmarkPlusIcon, ShareIcon } from "lucide-react"

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
			if (!match) return null

			const parsed = Number.parseInt(match[1], 10)
			if (isNaN(parsed)) return null

			return parsed
		},
		encode: (input) => input?.toString() ?? "",
	},
)

const ParamsSchema = Schema.Struct({
	playerId: PlayerIdParamSchema,
})

export const Route = createFileRoute("/sidenav-layout/players/$playerId")({
	component: RouteComponent,
	loader: ({ params, location, context: { ApiClient } }) =>
		Effect.runPromise(
			Effect.gen(function* () {
				const { playerId } = yield* Schema.decodeUnknown(ParamsSchema)(params)

				if (!playerId) {
					return yield* Effect.fail(new Error("Player ID is required"))
				}

				const playerData = yield* ApiClient.brawlhalla["get-player-by-id"]({
					path: { id: playerId },
				})

				const activeTabIndex = location.pathname
					.split("/")
					.findIndex((part) => part.startsWith(playerId.toString()))
				const activeTab =
					location.pathname.split("/")[activeTabIndex + 1] ?? "overview"

				return {
					activeTab,
					playerId: `${playerId}-${sluggify(playerData.data.name).slice(
						0,
						24,
					)}`,
					...playerData,
				}
			}),
		),
	staleTime: 5 * 60 * 1000, // 5 minutes
	head: ({ loaderData }) => {
		if (!loaderData) return {}
		const {
			data: { name },
		} = loaderData

		return {
			meta: seo({
				title: t`${name} - Player Stats • Corehalla`,
				description: t`${name} Stats - Brawlhalla Player Stats • Corehalla`,
			}),
		}
	},
})

interface ProfileHeaderProps {
	name: string
	avatar: string
	stats: MiscStat[]
	aliases?: string[]
	profileId: NewBookmark["pageId"]
	profileType: NewBookmark["pageType"]
}

function ProfileHeader({
	avatar,
	stats,
	name,
	profileId,
	profileType,
	aliases,
}: ProfileHeaderProps) {
	const { bookmark, toggleBookmark } = useBookmark(profileId, profileType)
	return (
		<div className="relative overflow-hidden rounded-lg bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 p-4 text-white sm:p-6 lg:p-8 border">
			<div className="absolute inset-0 bg-[url('/assets/images/brand/backgrounds/background-no-text.webp')] bg-cover bg-center opacity-80" />
			<div className="relative z-10">
				<div className="mb-4 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex items-center gap-3 sm:gap-4">
						<Avatar className="h-12 w-12 border-2 border-blue-400 sm:h-16 sm:w-16">
							<AvatarImage src={avatar || "/placeholder.svg"} alt={name} />
							<AvatarFallback className="bg-blue-600 text-white">
								{name.slice(0, 2).toUpperCase()}
							</AvatarFallback>
						</Avatar>
						<div>
							<h1 className="text-xl font-bold sm:text-2xl lg:text-3xl">
								{name}
							</h1>
							<p className="text-blue-300 text-sm uppercase font-semibold">
								#{profileId}
							</p>
						</div>
					</div>
					<div className="flex gap-2">
						<Button
							variant="outline"
							size="sm"
							className="border-white/20 bg-white/10 text-white hover:bg-white/20 text-xs sm:text-sm"
							onClick={() => toggleBookmark()}
						>
							{bookmark ? (
								<BookmarkCheckIcon className="h-3 w-3 sm:h-4 sm:w-4" />
							) : (
								<BookmarkPlusIcon className="h-3 w-3 sm:h-4 sm:w-4" />
							)}
						</Button>
						<Button
							variant="outline"
							size="sm"
							className="border-white/20 bg-white/10 text-white hover:bg-white/20 text-xs sm:text-sm"
						>
							<ShareIcon className="h-3 w-3 sm:h-4 sm:w-4" />
						</Button>
					</div>
				</div>

				{aliases && (
					<div className="mb-4 flex flex-wrap gap-1 sm:mb-6 sm:gap-2">
						{aliases.slice(0, 3).map((alias) => (
							<Badge
								key={alias}
								variant="secondary"
								className="bg-white/10 text-white text-xs"
							>
								{alias}
							</Badge>
						))}
						{aliases.length > 3 && (
							<Badge
								variant="secondary"
								className="bg-white/10 text-white text-xs"
							>
								+{aliases.length - 3} more
							</Badge>
						)}
					</div>
				)}

				<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 lg:gap-8">
					{stats.map((stat) => (
						<div className="text-center" key={stat.name}>
							<p className="text-xs text-blue-300 sm:text-sm">{stat.name}</p>
							<div className="text-base font-bold sm:text-lg lg:text-xl mt-1">
								{stat.value}
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	)
}

function RouteComponent() {
	const navigate = useNavigate()
	const { data: playerData, playerId, activeTab } = Route.useLoaderData()
	const playerName = cleanString(playerData.name)

	const { aliases, stats, legends, weapons } = playerData

	const accountStats: MiscStat[] = [
		{
			name: t`Account level`,
			value: stats.level,
			desc: t`${playerName}'s account level`,
		},
		{
			name: t`Account XP`,
			value: stats.xp.toLocaleString(),
			desc: t`${playerName}'s account XP`,
		},
		{
			name: t`In-game time`,
			value: formatTime(stats.matchtime),
			desc: t`Time ${playerName} spent in game`,
		},
		{
			name: t`Main legends`,
			value: (
				<div className="flex justify-center relative z-0">
					{legends.slice(0, 5).map((legend, i) => {
						const level = legend.stats.level ?? 0

						return (
							<LegendIcon
								key={legend.name_key}
								legendNameKey={legend.name_key}
								alt={legend.name}
								containerClassName="w-8 h-8 rounded-lg object-contain object-center -mr-2 shadow-md"
								className={cn(
									"w-8 h-8 rounded-lg object-contain object-center",
									{
										border: level > 10,
										"border-yellow-400 bg-yellow-400": level >= 100,
										"border-blue-400 bg-blue-400": level < 100 && level >= 50,
										"border-gray-900 bg-gray-900": level < 50 && level >= 25,
										"border-gray-100 bg-gray-100": level < 25 && level >= 10,
									},
								)}
								containerStyle={{
									zIndex: legends.length - i,
								}}
							/>
						)
					})}
				</div>
			),
			desc: t`${playerName}'s main legends`,
		},
		{
			name: t`Main weapons`,
			value: (
				<div className="flex gap-1 justify-center">
					{weapons.slice(0, 3).map((weapon) => (
						<WeaponIcon
							key={weapon.name}
							weapon={weapon.name}
							alt={weapon.name}
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
		<div className="flex flex-1 flex-col gap-4">
			<ProfileHeader
				avatar=""
				stats={accountStats}
				name={playerName}
				profileId={playerData.id.toString()}
				profileType="player_stats"
				aliases={aliases}
			/>

			<Tabs
				defaultValue={activeTab}
				className="w-full"
				onValueChange={(tab) => {
					if (tab === "overview") {
						navigate({
							to: "/players/$playerId",
							params: { playerId },
							replace: true,
							resetScroll: false,
						})
					} else {
						navigate({
							to: `/players/$playerId/${tab}`,
							params: { playerId },
							replace: true,
							resetScroll: false,
						})
					}
				}}
			>
				<ScrollArea className="w-full whitespace-nowrap">
					<TabsList>
						<TabsTrigger value="overview" className="text-xs sm:text-sm">
							Overview
						</TabsTrigger>
						{(playerData.ranked?.["2v2"]?.teams?.length ?? 0) > 0 && (
							<TabsTrigger value="2v2" className="text-xs sm:text-sm">
								2v2
							</TabsTrigger>
						)}
						<TabsTrigger value="legends" className="text-xs sm:text-sm">
							Legends
						</TabsTrigger>
						<TabsTrigger value="weapons" className="text-xs sm:text-sm">
							Weapons
						</TabsTrigger>
					</TabsList>
					<ScrollBar orientation="horizontal" />
				</ScrollArea>
				<Outlet />
			</Tabs>
		</div>
	)
}
