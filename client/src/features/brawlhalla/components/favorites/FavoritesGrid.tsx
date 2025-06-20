import { t } from "@lingui/core/macro"
import { Link } from "@tanstack/react-router"
import { Bookmark as BookmarkIcon, Shield, X } from "lucide-react"
import type { ReactNode } from "react"

import { useBookmark } from "@/features/bookmarks/hooks/use-bookmark"
import { LegendIcon, UnsafeImage } from "@/features/brawlhalla/components/Image"
import { css } from "@/panda/css"
import { cn } from "@/ui/lib/utils"
import { cleanString } from "@dair/common/src/helpers/clean-string"
import type {
	Bookmark,
	NewBookmark,
} from "@dair/schema/src/bookmarks/bookmarks"

import { legendsMap } from "@dair/brawlhalla-api/src/constants/legends"

interface FavoritesGridProps {
	bookmarks: Bookmark[]
}

const bookmarkWithRemoveButtonClass = css({
	"& .remove-btn": {
		display: "none",
		top: "-0.6rem",
		right: "-0.6rem",
	},
	"&:hover .remove-btn": {
		display: "flex",
	},
})

const getBookmarkLinkData = (bookmark: NewBookmark) => {
	// TODO: icon url
	switch (bookmark.pageType) {
		case "player_stats":
			return {
				to: "/stats/player/$playerId",
				params: { playerId: bookmark.pageId.toString() },
				type: t`Player`,
			}
		case "clan_stats":
			return {
				to: "/stats/clan/$clanId",
				params: { clanId: bookmark.pageId.toString() },
				type: t`Clan`,
			}
		default:
			return null
	}
}

interface BookmarkDisplayProps {
	pageId: NewBookmark["pageId"]
	pageType: NewBookmark["pageType"]
}

const BookmarkDisplay = ({ pageId, pageType }: BookmarkDisplayProps) => {
	const { bookmark, toggleBookmark } = useBookmark(pageId, pageType)

	let icon: ReactNode = <BookmarkIcon className="w-8 h-8" />

	if (!bookmark?.bookmarked) return null

	const favoriteName = cleanString(bookmark.name)
	const bookmarkLinkData = getBookmarkLinkData(bookmark)
	if (!bookmarkLinkData) return null

	switch (bookmark.pageType) {
		case "player_stats":
			{
				const meta = bookmark.meta
				if (!(meta && "icon" in meta.data)) break

				const playerIcon = meta.data.icon
				if (!playerIcon) break

				switch (playerIcon.type) {
					case "legend": {
						const legend = playerIcon.id
							? legendsMap[playerIcon.id as keyof typeof legendsMap]
							: null
						if (!legend) break

						icon = (
							<LegendIcon
								legendNameKey={legend.legend_name_key}
								alt={t`player ${favoriteName} icon`}
								containerClassName="w-8 h-8"
								className="object-contain object-center flex-shrink-0"
							/>
						)
						break
					}
					case "url": {
						icon = (
							<UnsafeImage
								src={playerIcon.url}
								alt={t`player ${favoriteName} icon`}
								containerClassName="w-8 h-8"
								className="w-8 h-8 object-contain object-center flex-shrink-0"
							/>
						)
						break
					}
				}
			}
			break
		case "clan_stats":
			icon = <Shield className="w-8 h-8" />
	}

	return (
		<div
			className={cn(
				"relative rounded-lg hover:bg-secondary",
				bookmarkWithRemoveButtonClass,
			)}
			key={`${bookmark.pageType}/${bookmark.id}`}
		>
			<Link
				{...bookmarkLinkData}
				className={cn("flex items-center gap-2 px-3 py-3")}
			>
				{icon}
				<div className="min-w-0">
					<p className="font-bold truncate">{cleanString(bookmark.name)}</p>
					<p className="text-xs text-muted-foreground truncate">
						{bookmark.pageType} #{bookmark.pageId}
					</p>
				</div>
			</Link>
			<button
				type="button"
				className="remove-btn w-5 h-5 absolute rounded-full overflow-hidden shadow-md bg-accent-foreground hover:bg-foreground hover:text-secondary items-center justify-center"
				onClick={() => deleteBookmark()}
			>
				<X className="w-4 h-4" />
			</button>
		</div>
	)
}

export const FavoritesGrid = ({ bookmarks }: FavoritesGridProps) => {
	return (
		<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols:6 gap-4">
			{bookmarks.slice(0, 12).map((bookmark) => {
				return <BookmarkDisplay bookmark={bookmark} key={bookmark.id} />
			})}
		</div>
	)
}
