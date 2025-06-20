import { SiDiscord as DiscordIcon } from "@icons-pack/react-simple-icons"
import { t } from "@lingui/core/macro"
import { Trans } from "@lingui/react/macro"
import { ExternalLink, UserRoundMinus, UserRoundPlus } from "lucide-react"
import type { ReactNode } from "react"
import toast from "react-hot-toast"

import { AdsenseStatsHeader } from "@/features/analytics/components/adsense"
import { useBookmark } from "@/features/bookmarks/hooks/use-bookmark"
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard"
import { Button } from "@/ui/components/button"
import { cn } from "@/ui/lib/utils"
import { cleanString } from "@dair/common/src/helpers/clean-string"
import type { NewBookmark } from "@dair/schema"

import { useSession } from "@/hooks/use-session"
import { MAX_SHOWN_ALIASES } from "@dair/brawlhalla-api/src/constants/aliases"
import type { MiscStat } from "./MiscStatGroup"
import { MiscStatGroup } from "./MiscStatGroup"

interface StatsHeaderProps {
	name: string
	id: number
	icon?: ReactNode
	aliases?: string[]
	miscStats?: MiscStat[]
	bookmarkPageId: NewBookmark["pageId"]
	bookmarkPageType: NewBookmark["pageType"]
}

export const StatsHeader = ({
	name,
	id,
	icon,
	aliases,
	miscStats,
	bookmarkPageId,
	bookmarkPageType,
}: StatsHeaderProps) => {
	const { isLoggedIn, logInWithDiscord } = useSession()
	const { bookmark, toggleBookmark } = useBookmark(
		bookmarkPageId,
		bookmarkPageType,
	)
	const copyToClipboard = useCopyToClipboard()

	return (
		<>
			<div
				className="w-full h-28 max-h-28 relative rounded-md overflow-hidden shadow-md"
				style={{
					background:
						"url(/assets/images/brand/backgrounds/background-text-sm.jpg)",
					backgroundPosition: "center",
					backgroundSize: "cover",
				}}
			>
				<AdsenseStatsHeader />
			</div>
			<div className="flex flex-col sm:flex-row justify-end py-2 gap-2">
				{isLoggedIn ? (
					<Button
						variant={bookmark?.bookmarked ? "outline" : "primary"}
						onClick={() => {
							toggleBookmark(!bookmark?.bookmarked)
						}}
					>
						{bookmark?.bookmarked ? (
							<>
								<Trans>Remove Favorite</Trans>
								<UserRoundMinus className="ml-2 w-4 h-4" />
							</>
						) : (
							<>
								<Trans>Add favorite</Trans>
								<UserRoundPlus className="ml-2 w-4 h-4" />
							</>
						)}
					</Button>
				) : (
					<Button onClick={logInWithDiscord}>
						<DiscordIcon size="16" className="mr-2" />{" "}
						<Trans>Sign in to add favorites</Trans>
					</Button>
				)}
				<Button
					variant="outline"
					onClick={() => {
						copyToClipboard(window.location.href)
						toast(t`Copied link to clipboard!`, {
							icon: "📋",
						})
					}}
				>
					<ExternalLink size="16" className="mr-2" /> <Trans>Share</Trans>
				</Button>
			</div>
			<div
				className={cn("flex flex-col justify-center items-center", {
					"mt-8": !bookmark?.bookmarked,
					"mt-4": bookmark?.bookmarked,
				})}
			>
				<h1 className="font-bold text-3xl lg:text-5xl flex items-center">
					{icon}
					{name}
				</h1>
				<span className="text-xs font-bold mt-1 text-muted-foreground">
					#{id}
				</span>
			</div>
			{!!aliases && aliases.length > 0 && (
				<div className="flex flex-wrap gap-2 mt-4 justify-center">
					{aliases.slice(0, MAX_SHOWN_ALIASES).map((alias) => (
						<p key={alias} className={cn("rounded-lg py-0.5 px-3 bg-border")}>
							{cleanString(alias)}
						</p>
					))}
				</div>
			)}
			{miscStats && (
				<MiscStatGroup
					className="mt-8 justify-items-center text-center"
					fit="fit"
					stats={miscStats}
				/>
			)}
		</>
	)
}
