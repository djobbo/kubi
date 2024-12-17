import { t } from "@lingui/core/macro"
import type { LucideIcon } from "lucide-react"
import { HomeIcon } from "lucide-react"

import type { FileRouteTypes } from "@/routeTree.gen"

interface NavLink {
  to: FileRouteTypes["to"]
  title: string
  Icon: LucideIcon
  isActive: (pathname: string, to: string) => boolean
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
        isActive: (pathname, to) => pathname === to,
      },
      // {
      //   to: "/generate",
      //   title: t`Generate`,
      //   Icon: SparkleIcon,
      //   isActive: (pathname, to) => pathname.startsWith(to),
      // },
    ] as const satisfies NavLink[],
    sidebar: [
      // {
      //   to: "/generate",
      //   title: "Generate",
      //   Icon: SparkleIcon,
      //   isActive: (pathname, to) => pathname.startsWith(to),
      //   items: [
      //     {
      //       to: "/generate",
      //       title: "Home",
      //       Icon: SparkleIcon,
      //       isActive: (pathname, to) => pathname.startsWith(to),
      //     },
      //   ],
      // },
    ] as const satisfies SidebarLink[],
  }) as const)()
