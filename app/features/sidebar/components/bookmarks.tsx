import { t } from "@lingui/core/macro"
import { Trans } from "@lingui/react/macro"
import { Link } from "@tanstack/react-router"
import {
  BookmarkIcon,
  Folder,
  Forward,
  MoreHorizontal,
  Trash2,
} from "lucide-react"

import type { Bookmark } from "@/db/schema"
import { useBookmarks } from "@/features/bookmarks/hooks/use-bookmarks"
import { getLegendIconSrc } from "@/features/brawlhalla/components/Image"
import { Image } from "@/features/brawlhalla/components/Image"
import { legendsMap } from "@/features/brawlhalla/constants/legends"
import { cleanString } from "@/helpers/cleanString"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/ui/components/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/ui/components/sidebar"

const getBookmarkIconUrl = (bookmark: Bookmark) => {
  const meta = bookmark.meta
  if (!(meta && "icon" in meta.data)) return

  switch (meta.data.icon?.type) {
    case "legend": {
      const legendId = meta.data.icon.id
      if (!legendId) break

      const legend = legendsMap[legendId]
      if (!legend) break

      return getLegendIconSrc(legend.legend_name_key)
      break
    }
    case "url": {
      return meta.data.icon.url
      break
    }
  }
}

interface NavBookmarkProps {
  bookmark: Bookmark
}

const NavBookmark = ({ bookmark, ...props }: NavBookmarkProps) => {
  const cleanName = cleanString(bookmark.name)

  if (bookmark.pageType === "player_stats") {
    const image = getBookmarkIconUrl(bookmark)

    return (
      <Link
        {...props}
        to={`/stats/player/$playerId`}
        params={{ playerId: bookmark.pageId }}
      >
        <Image
          src={image}
          alt={t`player ${cleanName} icon`}
          Container="span"
          containerClassName="w-4 h-4 text-xs z-0 opacity-50 rounded-md overflow-hidden"
          className="object-contain object-center"
        />
        <span className="truncate">{bookmark.name}</span>
      </Link>
    )
  }

  if (bookmark.pageType === "clan_stats") {
    return (
      <Link
        {...props}
        to={`/stats/clan/$clanId`}
        params={{ clanId: bookmark.pageId }}
      >
        <BookmarkIcon />
        <span className="truncate">{bookmark.name}</span>
      </Link>
    )
  }

  return null
}

export const NavBookmarks = () => {
  const { isMobile } = useSidebar()
  const bookmarks = useBookmarks()

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Bookmarks</SidebarGroupLabel>
      <SidebarMenu>
        {bookmarks.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton asChild>
              <NavBookmark bookmark={item} />
            </SidebarMenuButton>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuAction showOnHover>
                  <MoreHorizontal />
                  <span className="sr-only">More</span>
                </SidebarMenuAction>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-48 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align={isMobile ? "end" : "start"}
              >
                <DropdownMenuItem>
                  <Folder className="text-muted-foreground" />
                  <span>View Project</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Forward className="text-muted-foreground" />
                  <span>Share Project</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Trash2 className="text-muted-foreground" />
                  <span>Delete Project</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}
        <SidebarMenuItem>
          <SidebarMenuButton className="text-sidebar-foreground/70" asChild>
            <Link to="/@me/bookmarks">
              <MoreHorizontal className="text-sidebar-foreground/70" />
              <span>
                <Trans>All Bookmarks</Trans>
              </span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  )
}
