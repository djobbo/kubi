import { Trans } from "@lingui/react/macro"
import { createFileRoute } from "@tanstack/react-router"

import { useBookmarks } from "@/features/bookmarks/hooks/use-bookmarks"
import { FavoritesGrid } from "@/features/brawlhalla/components/favorites/FavoritesGrid"
import { SectionTitle } from "@/features/brawlhalla/components/layout/SectionTitle"

export const Route = createFileRoute("/old-routes/@me/bookmarks")({
	component: RouteComponent,
})

function RouteComponent() {
	const bookmarks = useBookmarks()
	const players = bookmarks.filter(
		(bookmark) => bookmark.pageType === "player_stats",
	)
	const clans = bookmarks.filter(
		(bookmark) => bookmark.pageType === "clan_stats",
	)

	return (
		<>
			<h1>
				<Trans>Bookmarks</Trans>
			</h1>
			<SectionTitle hasBorder>
				<Trans>Players</Trans>
			</SectionTitle>
			<FavoritesGrid bookmarks={players} />
			<SectionTitle hasBorder>
				<Trans>Clans</Trans>
			</SectionTitle>
			<FavoritesGrid bookmarks={clans} />
		</>
	)
}
