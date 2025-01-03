import { t } from "@lingui/core/macro"
import { Link } from "@tanstack/react-router"
import { Bookmark as BookmarkIcon, Shield, X } from "lucide-react"
import type { ReactNode } from "react"

import { useBookmark } from "@/features/bookmarks/hooks/use-bookmark"
import type {
  Bookmark,
  NewBookmark,
} from "@/features/bookmarks/schema/bookmarks"
import { Image, LegendIcon } from "@/features/brawlhalla/components/Image"
import { cleanString } from "@/helpers/cleanString"
import { css } from "@/panda/css"
import { cn } from "@/ui/lib/utils"

import { legendsMap } from "../../constants/legends"

interface FavoritesGridProps {
  bookmarks: Bookmark[]
}

const favoriteClassName = css({
  "&:hover .remove-btn": {
    display: "block",
    top: "-0.6rem",
    right: "-0.6rem",
  },
})

const getBookmarkLinkData = (bookmark: NewBookmark) => {
  // TODO: icon url
  switch (bookmark.pageType) {
    case "player_stats":
      return {
        to: `/stats/player/$playerId`,
        params: { playerId: bookmark.pageId.toString() },
        type: t`Player`,
      }
    case "clan_stats":
      return {
        to: `/stats/clan/$clanId`,
        params: { clanId: bookmark.pageId.toString() },
        type: t`Clan`,
      }
    default:
      return null
  }
}

interface BookmarkDisplayProps {
  bookmark: NewBookmark
}

const BookmarkDisplay = ({ bookmark }: BookmarkDisplayProps) => {
  const { isBookmarked, deleteBookmark } = useBookmark(bookmark, true)

  let icon: ReactNode = <BookmarkIcon className="w-8 h-8" />

  if (!isBookmarked) return null

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
            const legend = playerIcon.id ? legendsMap[playerIcon.id] : null
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
              <Image
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
      className={cn("relative rounded-lg hover:bg-bgVar2", favoriteClassName)}
      key={`${bookmark.pageType}/${bookmark.id}`}
    >
      <Link
        {...bookmarkLinkData}
        className={cn("flex items-center gap-2 px-3 py-3")}
      >
        {icon}
        <div className="min-w-0">
          <p className="font-bold truncate">{cleanString(bookmark.name)}</p>
          <p className="text-xs text-textVar1 truncate">
            {bookmark.pageType} #{bookmark.id}
          </p>
        </div>
      </Link>
      <button
        type="button"
        className="hidden remove-btn absolute w-5 h-5 p-0.5 rounded-full overflow-hidden shadow-md bg-accentOld hover:bg-text hover:text-bgVar2"
        onClick={() => deleteBookmark()}
      >
        <X />
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
