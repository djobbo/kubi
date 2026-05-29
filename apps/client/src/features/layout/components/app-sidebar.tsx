import { getAppNavItems, isNavGroup } from "@/features/layout/nav-links"
import { LandingBackground } from "@/features/layout/components/landing-background"
import { SidebarNavGroup } from "@/features/layout/components/sidebar-nav-group"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarNavLink,
  SidebarRail,
  sidebarMenuButtonVariants,
} from "@/shared/components/sidebar"
import { cn } from "@dair/common/src/helpers/ui"
import { Link, useParams } from "@tanstack/react-router"

export function AppSidebar() {
  const { locale } = useParams({ strict: false })
  const navItems = getAppNavItems(locale)

  return (
    <Sidebar variant="floating" collapsible="icon">
      <LandingBackground className="pointer-events-none absolute inset-0 z-0 size-full opacity-50" />
      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        <SidebarHeader>
          <Link
            to="/{-$locale}"
            params={{ locale }}
            className={cn(
              sidebarMenuButtonVariants(),
              "font-semibold tracking-tight text-text",
            )}
          >
            <span className="flex size-8 shrink-0 items-center justify-center corner-smooth-md bg-primary text-sm font-bold text-text">
              D
            </span>
            <span className="truncate group-data-[collapsible=icon]:hidden">
              dair.gg
            </span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup className="p-0">
            <SidebarMenu>
              {navItems.map((item) => {
                if (isNavGroup(item)) {
                  return <SidebarNavGroup key={item.tooltip} group={item} />
                }

                const ItemIcon = item.icon
                return (
                  <SidebarMenuItem key={item.tooltip}>
                    <SidebarNavLink
                      to={item.to}
                      params={item.params}
                      activeOptions={item.activeOptions}
                      tooltip={item.tooltip}
                    >
                      <ItemIcon />
                      <span>{item.label}</span>
                    </SidebarNavLink>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </div>
      <SidebarRail className="md:hidden" />
    </Sidebar>
  )
}
