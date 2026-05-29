import { t } from "@lingui/core/macro"
import { Trans } from "@lingui/react/macro"
import type { LinkProps, useMatchRoute } from "@tanstack/react-router"
import {
  HomeIcon,
  SwordsIcon,
  TrophyIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react"
import type { ReactNode } from "react"

export type AppNavLink = {
  to: LinkProps["to"]
  params: LinkProps["params"]
  activeOptions?: LinkProps["activeOptions"]
  tooltip: string
  label: ReactNode
  icon: LucideIcon
}

export type AppNavGroup = {
  type: "group"
  tooltip: string
  label: ReactNode
  icon: LucideIcon
  items: AppNavLink[]
}

export type AppNavItem = ({ type: "link" } & AppNavLink) | AppNavGroup

export function getRankingsNavLinks(locale: string | undefined): AppNavLink[] {
  return [
    {
      to: "/{-$locale}/brawlhalla/rankings/1v1/{-$region}/{-$page}",
      params: { locale, region: "all", page: "1" },
      tooltip: t`1v1 rankings`,
      label: <Trans>1v1 rankings</Trans>,
      icon: SwordsIcon,
    },
    {
      to: "/{-$locale}/brawlhalla/rankings/2v2/{-$region}/{-$page}",
      params: { locale, region: "all", page: "1" },
      tooltip: t`2v2 rankings`,
      label: <Trans>2v2 rankings</Trans>,
      icon: UsersIcon,
    },
  ]
}

export function getAppNavItems(locale: string | undefined): AppNavItem[] {
  return [
    {
      type: "link",
      to: "/{-$locale}",
      params: { locale },
      activeOptions: { exact: true },
      tooltip: t`Home`,
      label: <Trans>Home</Trans>,
      icon: HomeIcon,
    },
    {
      type: "group",
      tooltip: t`Rankings`,
      label: <Trans>Rankings</Trans>,
      icon: TrophyIcon,
      items: getRankingsNavLinks(locale),
    },
  ]
}

export function isNavGroup(item: AppNavItem): item is AppNavGroup {
  return item.type === "group"
}

type MatchRoute = ReturnType<typeof useMatchRoute>

export function isNavLinkActive(
  matchRoute: MatchRoute,
  link: Pick<AppNavLink, "to" | "params" | "activeOptions">,
) {
  return !!matchRoute({
    to: link.to,
    params: link.params,
    ...link.activeOptions,
  })
}

export function isNavGroupActive(matchRoute: MatchRoute, group: AppNavGroup) {
  return group.items.some((item) => isNavLinkActive(matchRoute, item))
}
