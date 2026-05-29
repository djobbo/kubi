import {
  getAppNavItems,
  isNavGroup,
  isNavGroupActive,
  isNavLinkActive,
  type AppNavGroup,
} from "@/features/layout/nav-links"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIcon,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewportPortal,
} from "@/shared/components/navigation-menu"
import { cn } from "@dair/common/src/helpers/ui"
import { Link, useMatchRoute, useParams } from "@tanstack/react-router"
import { ChevronDownIcon } from "lucide-react"

function RankingsNavMenuItem({ group }: { group: AppNavGroup }) {
  const matchRoute = useMatchRoute()
  const isActive = isNavGroupActive(matchRoute, group)
  const GroupIcon = group.icon

  return (
    <NavigationMenuItem>
      <NavigationMenuTrigger
        className={cn(isActive && "bg-bg-light font-medium text-text")}
      >
        <GroupIcon className="size-4" />
        {group.label}
        <NavigationMenuIcon>
          <ChevronDownIcon className="size-4" />
        </NavigationMenuIcon>
      </NavigationMenuTrigger>
      <NavigationMenuContent>
        <ul className="m-0 flex min-w-44 list-none flex-col gap-0.5 p-0">
          {group.items.map((item) => {
            const ItemIcon = item.icon
            const active = isNavLinkActive(matchRoute, item)

            return (
              <li key={item.tooltip}>
                <NavigationMenuLink
                  render={
                    <Link
                      to={item.to}
                      params={item.params}
                      activeOptions={item.activeOptions}
                    />
                  }
                  active={active}
                  closeOnClick
                >
                  <ItemIcon className="size-4 shrink-0" />
                  {item.label}
                </NavigationMenuLink>
              </li>
            )
          })}
        </ul>
      </NavigationMenuContent>
    </NavigationMenuItem>
  )
}

export function SiteNavMenu() {
  const { locale } = useParams({ strict: false })
  const matchRoute = useMatchRoute()
  const navItems = getAppNavItems(locale)

  return (
    <NavigationMenu className="hidden md:flex">
      <NavigationMenuList>
        {navItems.map((item) => {
          if (isNavGroup(item)) {
            return <RankingsNavMenuItem key={item.tooltip} group={item} />
          }

          const active = isNavLinkActive(matchRoute, item)
          const ItemIcon = item.icon

          return (
            <NavigationMenuItem key={item.tooltip}>
              <NavigationMenuLink
                render={
                  <Link
                    to={item.to}
                    params={item.params}
                    activeOptions={item.activeOptions}
                  />
                }
                active={active}
              >
                <ItemIcon className="size-4 shrink-0" />
                {item.label}
              </NavigationMenuLink>
            </NavigationMenuItem>
          )
        })}
      </NavigationMenuList>
      <NavigationMenuViewportPortal />
    </NavigationMenu>
  )
}
