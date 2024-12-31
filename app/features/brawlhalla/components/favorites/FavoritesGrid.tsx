import { css } from "@emotion/css"
import { t } from "@lingui/core/macro"
import { Link } from "@tanstack/react-router"
import { Shield, X } from "lucide-react"
import type { ReactNode } from "react"

import type { Bookmark } from "@/features/bookmarks/schema/bookmarks"
import { useBookmarks } from "@/features/bookmarks/use-bookmarks"
import { LegendIcon } from "@/features/brawlhalla/components/Image"
import { cleanString } from "@/helpers/cleanString"
import { cn } from "@/ui/lib/utils"

import { legendsMap } from "../../constants/legends"

interface FavoritesGridProps {
  bookmarks: Bookmark[]
}

const favoriteClassName = css`
  &:hover .remove-btn {
    display: block;
    top: -0.6rem;
    right: -0.6rem;
  }
`

const getBookmarkLinkData = (bookmark: Bookmark) => {
  // TODO: icon url
  switch (bookmark.pageType) {
    case "player_stats":
      return {
        to: `/stats/player/$playerId`,
        params: { playerId: bookmark.id.toString() },
        type: t`Player`,
      }
    case "clan_stats":
      return {
        to: `/stats/clan/$clanId`,
        params: { clanId: bookmark.id.toString() },
        type: t`Clan`,
      }
    default:
      return null
  }
}

export const FavoritesGrid = ({ bookmarks }: FavoritesGridProps) => {
  const { deleteBookmark } = useBookmarks()

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols:6 gap-4">
      {bookmarks.slice(0, 12).map((bookmark) => {
        let icon: ReactNode = null

        const favoriteName = cleanString(bookmark.name)
        const bookmarkLinkData = getBookmarkLinkData(bookmark)
        if (!bookmarkLinkData) return null

        if (bookmark.pageType === "player_stats") {
          const legendId = bookmark.meta.icon?.legend_id
          const legend = !!legendId && legendsMap[legendId]
          if (legend)
            icon = (
              <LegendIcon
                legendNameKey={legend.legend_name_key}
                alt={t`player ${favoriteName} icon`}
                containerClassName="w-8 h-8"
                className="object-contain object-center flex-shrink-0"
              />
            )
        } else if (bookmark.pageType === "clan_stats") {
          icon = <Shield className="w-8 h-8" />
        }

        return (
          <div
            className={cn(
              "relative rounded-lg hover:bg-bgVar2",
              favoriteClassName,
            )}
            key={`${bookmark.pageType}/${bookmark.id}`}
          >
            <Link
              {...bookmarkLinkData}
              className={cn("flex items-center gap-2 px-3 py-3")}
            >
              {icon}
              <div className="min-w-0">
                <p className="font-bold truncate">
                  {cleanString(bookmark.name)}
                </p>
                <p className="text-xs text-textVar1 truncate">
                  {bookmark.pageType} #{bookmark.id}
                </p>
              </div>
            </Link>
            <button
              type="button"
              className="hidden remove-btn absolute w-5 h-5 p-0.5 rounded-full overflow-hidden shadow-md bg-accentOld hover:bg-text hover:text-bgVar2"
              onClick={() => deleteBookmark(bookmark)}
            >
              <X />
            </button>
          </div>
        )
      })}
    </div>
  )
}
