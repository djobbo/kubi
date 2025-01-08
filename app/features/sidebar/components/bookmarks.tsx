import { t } from "@lingui/core/macro"
import { Trans } from "@lingui/react/macro"
import { Link } from "@tanstack/react-router"
import {
  BookmarkIcon,
  Folder,
  Forward,
  MoreHorizontal,
  ShieldIcon,
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
  isCollapsed?: boolean
  bookmark: Bookmark
}

const NavBookmark = ({ bookmark, isCollapsed, ...props }: NavBookmarkProps) => {
  const cleanName = cleanString(bookmark.name)

  if (bookmark.pageType === "player_stats") {
    const image = getBookmarkIconUrl(bookmark)

    return (
      <Link
        {...props}
        to={`/stats/player/$playerId`}
        params={{ playerId: bookmark.pageId }}
      >
        {isCollapsed ? (
          <div className="relative flex items-center justify-center">
            {image && (
              <Image
                src={image}
                alt={t`player ${cleanName} icon`}
                containerClassName="w-6 h-6 text-xs z-0 opacity-50 rounded-md overflow-hidden top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                position="absolute"
                className="object-contain object-center"
              />
            )}
            <span className="truncate relative font-semibold text-xs">
              {cleanName.slice(0, 3).toUpperCase()}
            </span>
          </div>
        ) : (
          <>
            <Image
              src={image}
              alt={t`player ${cleanName} icon`}
              containerClassName="inline-block w-4 h-4 text-xs z-0 rounded-md overflow-hidden shrink-0"
              className="object-contain object-center"
            />
            <span className="truncate">{cleanName}</span>
          </>
        )}
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
        <ShieldIcon />
        <span className="truncate">{cleanName}</span>
      </Link>
    )
  }

  return null
}

export const NavBookmarks = () => {
  const { isMobile } = useSidebar()
  const bookmarks = useBookmarks()
  const sidebar = useSidebar()
  const isCollapsed = sidebar.state === "collapsed"

  return (
    <SidebarGroup
    // className="group-data-[collapsible=icon]:hidden"
    >
      <SidebarGroupLabel>
        <Trans>Bookmarks</Trans>
      </SidebarGroupLabel>
      <SidebarMenu>
        {isCollapsed && (
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip={t`All Bookmarks`}>
              <Link to="/@me/bookmarks">
                <BookmarkIcon />
                <span>
                  <Trans>All Bookmarks</Trans>
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )}
        {bookmarks.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton asChild tooltip={item.name}>
              <NavBookmark bookmark={item} isCollapsed={isCollapsed} />
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
        {!isCollapsed && (
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
        )}
      </SidebarMenu>
    </SidebarGroup>
  )
}
