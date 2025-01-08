import { SiDiscord as DiscordIcon } from "@icons-pack/react-simple-icons"
import { t } from "@lingui/core/macro"
import type { LucideIcon } from "lucide-react"
import {
  BookOpenTextIcon,
  ChevronsUpIcon,
  HomeIcon,
  ShieldIcon,
  UsersRoundIcon,
} from "lucide-react"

import type { FileRouteTypes } from "@/routeTree.gen"

interface NavLink {
  to: FileRouteTypes["to"]
  title: string
  Icon: LucideIcon
  isActive: (pathname: string) => boolean
  target?: string
}

interface SidebarLink extends NavLink {
  items?: NavLink[]
}

export const navConfig = (() =>
  ({
    main: [
      {
        to: "/",
        title: t`Home`,
        Icon: HomeIcon,
        isActive: (pathname) => pathname === "/",
      },
      // {
      //   to: "/generate",
      //   title: t`Generate`,
      //   Icon: SparkleIcon,
      //   isActive: (pathname, to) => pathname.startsWith(to),
      // },
    ] as const satisfies NavLink[],
    sidebar: [
      {
        to: "/",
        title: t`Home`,
        Icon: HomeIcon,
        isActive: (pathname) => pathname === "/",
      },
      {
        to: "/rankings/1v1/$",
        title: t`1v1 Rankings`,
        Icon: ChevronsUpIcon,
        isActive: (pathname) => pathname.startsWith("/rankings/1v1"),
      },
      {
        to: "/rankings/2v2/$",
        title: t`2v2 Rankings`,
        Icon: UsersRoundIcon,
        isActive: (pathname) => pathname.startsWith("/rankings/2v2"),
      },
      {
        to: "/rankings/clans/$",
        title: t`Clans`,
        Icon: ShieldIcon,
        isActive: (pathname) => pathname.startsWith("/rankings/clans"),
      },
      // {
      //   to: "/rankings/power/$",
      //   title: t`Power rankings`,
      //   Icon: ZapIcon,
      //   isActive: (pathname, to) => pathname === to,
      //   items: [
      //     {
      //       to: "/rankings/power/$",
      //       params:{{ _splat: '1v1'}},
      //       title: "1v1 Power Rankings",
      //       Icon: SparkleIcon,
      //       isActive: (pathname, to) => pathname.startsWith(to),
      //     },
      //     {
      //       to: "/rankings/power/$",
      //       params:{{ _splat: '2v2'}},
      //       title: "2v2 Power Rankings",
      //       Icon: SparkleIcon,
      //       isActive: (pathname, to) => pathname.startsWith(to),
      //     },
      //   ],
      // },
      {
        to: "/discord",
        title: t`Discord Server`,
        Icon: DiscordIcon,
        isActive: (pathname) => pathname === "/discord",
        target: "_blank",
      },
      {
        to: "/wiki",
        title: t`Wiki`,
        Icon: BookOpenTextIcon,
        isActive: (pathname) => pathname === "/wiki",
        target: "_blank",
      },
    ] satisfies SidebarLink[],
  }) as const)()
