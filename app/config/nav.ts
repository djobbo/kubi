import type { Link } from "@tanstack/react-router"
import type { LucideIcon } from "lucide-react"
import { HomeIcon, SparkleIcon } from "lucide-react"
import type { ComponentProps } from "react"

interface NavLink {
  to: ComponentProps<typeof Link>["to"]
  name: string
  Icon: LucideIcon
  isActive: (pathname: string, to: string) => boolean
}

const main = [
  {
    to: "/",
    name: "Home",
    Icon: HomeIcon,
    isActive: (pathname, to) => pathname === to,
  },
  {
    to: "/generate",
    name: "Generate",
    Icon: SparkleIcon,
    isActive: (pathname, to) => pathname.startsWith(to),
  },
] as const satisfies NavLink[]

interface SidebarLink extends NavLink {
  items?: NavLink[]
}

const sidebar = [
  // {
  //   to: "/generate",
  //   name: "Generate",
  //   Icon: SparkleIcon,
  //   isActive: (pathname, to) => pathname.startsWith(to),
  //   items: [
  //     {
  //       to: "/generate",
  //       name: "Home",
  //       Icon: SparkleIcon,
  //       isActive: (pathname, to) => pathname.startsWith(to),
  //     },
  //   ],
  // },
] as const satisfies SidebarLink[]

export const navConfig = { main, sidebar } as const
