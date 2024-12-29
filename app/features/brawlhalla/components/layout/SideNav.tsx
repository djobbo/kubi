import { css } from "@emotion/css"
import { SiDiscord as DiscordIcon } from "@icons-pack/react-simple-icons"
import { t } from "@lingui/core/macro"
import { Link, useRouterState } from "@tanstack/react-router"
import {
  BookOpenText,
  ChevronsUp,
  Heart,
  House,
  Shield,
  UsersRound,
  X,
  Zap,
} from "lucide-react"
import type { ReactNode } from "react"

import { Tooltip } from "@/components/base/Tooltip"
import { useBookmarks } from "@/features/bookmarks/use-bookmarks"
import { Image } from "@/features/brawlhalla/components/Image"
import { useSideNav } from "@/features/sidenav/sidenav-provider"
import { cleanString } from "@/helpers/cleanString"
import { Button } from "@/ui/components/button"
import { cn } from "@/ui/lib/utils"

import { legendsMap } from "../../constants/legends"

interface SideNavIconProps {
  className?: string
  image?: string
  name: string
  content?: ReactNode
  href: string
  active?: boolean
  onRemove?: () => void
  desc?: string
  external?: boolean
}

const sideNavIconClassName = css`
  &:hover .remove-btn {
    display: flex;
    top: -0.375rem;
    right: -0.375rem;
  }
`

const SideNavIcon = ({
  className,
  image,
  name,
  content,
  href,
  onRemove,
  active = false,
  desc,
  external = false,
}: SideNavIconProps) => {
  const { closeSideNav } = useSideNav()
  const cleanName = cleanString(name)

  return (
    <Tooltip content={desc ?? cleanName} side="right">
      <div className={cn("relative", sideNavIconClassName)}>
        <Button asChild variant={active ? "outline" : "ghost"}>
          <Link
            to={href}
            className={cn(className, "w-full sm:w-10 h-10")}
            target={external ? "_blank" : undefined}
            onClick={() => {
              closeSideNav()
            }}
          >
            {image && (
              <Image
                src={image}
                alt={t`player ${cleanName} icon`}
                Container="span"
                containerClassName="w-8 h-8 text-xs z-0 opacity-50 rounded-md overflow-hidden"
                // eslint-disable-next-line lingui/no-unlocalized-strings
                position="relative sm:absolute"
                className="object-contain object-center"
              />
            )}
            <span className="font-semibold text-sm z-10 hidden sm:inline-block whitespace-nowrap">
              {content ?? cleanName.slice(0, 3)}
            </span>
            <span className="text-sm inline-flex items-center gap-2 sm:hidden whitespace-nowrap">
              {content}
              {cleanName.slice(0, 20)}
            </span>
          </Link>
        </Button>
        {onRemove && (
          <button
            type="button"
            className="items-center justify-center hidden remove-btn absolute w-4 h-4 p-0.5 rounded-full overflow-hidden shadow-md bg-accent hover:bg-text hover:text-bgVar2"
            onClick={() => onRemove()}
          >
            <X size={12} />
          </button>
        )}
      </div>
    </Tooltip>
  )
}

const getDefaultNav = (): {
  name: string
  icon: ReactNode
  href: string
  exact?: boolean
  external?: boolean
}[] => [
  {
    name: t`Home`,
    icon: <House className="w-6 h-6" />,
    href: "/",
    exact: true,
  },
  {
    name: t`1v1 Rankings`,
    icon: <ChevronsUp className="w-6 h-6" />,
    href: "/rankings/1v1",
    exact: false,
  },
  {
    name: t`2v2 Rankings`,
    icon: <UsersRound className="w-6 h-6" />,
    href: "/rankings/2v2",
    exact: false,
  },
  {
    name: t`Power Rankings`,
    href: "/rankings/power",
    icon: <Zap className="w-6 h-6" />,
  },
  {
    name: t`Clans`,
    href: "/rankings/clans",
    icon: <Shield className="w-6 h-6" />,
  },
  {
    name: t`Discord Server`,
    href: "/discord",
    icon: <DiscordIcon className="w-6 h-6" />,
    external: true,
  },
  {
    name: t`Wiki`,
    href: "/wiki",
    icon: <BookOpenText className="w-6 h-6" />,
    external: true,
  },
]

interface SideNavProps {
  className?: string
}

export const SideNav = ({ className }: SideNavProps) => {
  const { bookmarks, deleteBookmark } = useBookmarks()
  const router = useRouterState()

  const { isSideNavOpen, closeSideNav } = useSideNav()

  const { pathname } = router.location
  const searchParams = new URLSearchParams(router.location.search)
  const playerId = searchParams.get("playerId")
  const clanId = searchParams.get("clanId")

  const nav = getDefaultNav().concat(
    bookmarks.length > 0
      ? [
          {
            name: t`Favorites`,
            icon: <Heart className="w-6 h-6" />,
            href: "/@me/favorites",
            exact: false,
          },
        ]
      : [],
  )

  return (
    <div className="z-50">
      <button
        type="button"
        className={cn(
          "fixed w-full h-full inset-0 bg-bgVar2 opacity-50 cursor-default",
          {
            hidden: !isSideNavOpen,
          },
        )}
        onClick={() => {
          closeSideNav()
        }}
      />
      <div
        className={cn("w-full flex-col", className, {
          "-translate-x-full sm:translate-x-0": !isSideNavOpen,
          "translate-x-0": isSideNavOpen,
        })}
        style={{
          transition: "0.15s all ease",
        }}
      >
        <div className="flex flex-col gap-2 flex-1 p-2">
          {nav.map((nav) => (
            <SideNavIcon
              key={nav.name}
              name={nav.name}
              content={nav.icon}
              href={nav.href}
              active={
                nav.exact
                  ? pathname === nav.href
                  : pathname.startsWith(nav.href)
              }
              external={nav.external}
            />
          ))}
          <hr
            className={cn("border-b border-bg rounded-full mx-2", {
              hidden: bookmarks.length <= 0,
            })}
          />
          {bookmarks.map((bookmark) => {
            switch (bookmark.pageType) {
              case "player_stats": {
                const meta = bookmark.meta
                const legendId = meta?.icon?.legend_id
                const legend = !!legendId && legendsMap[legendId]
                return (
                  <SideNavIcon
                    key={bookmark.id}
                    href={`/stats/player/${bookmark.id}`}
                    name={cleanString(bookmark.name)}
                    {...(legend && {
                      image: `/images/icons/roster/legends/${legend.legend_name_key}.png`,
                    })}
                    active={
                      pathname === "/stats/player/[playerId]" &&
                      playerId === bookmark.id.toString()
                    }
                    onRemove={() => {
                      deleteBookmark(bookmark)
                    }}
                  />
                )
              }
              case "clan_stats":
                return (
                  <SideNavIcon
                    key={bookmark.id}
                    href={`/stats/clan/${bookmark.id}`}
                    name={cleanString(bookmark.name)}
                    active={
                      pathname === "/stats/clan/[clanId]" &&
                      clanId === bookmark.id.toString()
                    }
                    onRemove={() => {
                      deleteBookmark(bookmark)
                    }}
                  />
                )
              default:
                return null
            }
          })}
        </div>
      </div>
    </div>
  )
}
