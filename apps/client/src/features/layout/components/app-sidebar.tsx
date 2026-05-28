import { LandingBackground } from "@/features/layout/components/landing-background"
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
import { t } from "@lingui/core/macro"
import { Trans } from "@lingui/react/macro"
import { Link, useParams } from "@tanstack/react-router"
import { HomeIcon, SwordsIcon, UsersIcon } from "lucide-react"

export function AppSidebar() {
  const { locale } = useParams({ strict: false })

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
              <SidebarMenuItem>
                <SidebarNavLink
                  to="/{-$locale}"
                  params={{ locale }}
                  tooltip={t`Home`}
                  activeOptions={{ exact: true }}
                >
                  <HomeIcon />
                  <span>
                    <Trans>Home</Trans>
                  </span>
                </SidebarNavLink>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarNavLink
                  to="/{-$locale}/brawlhalla/rankings/1v1/{-$region}/{-$page}"
                  params={{ locale, region: "all", page: "1" }}
                  tooltip={t`1v1 rankings`}
                >
                  <SwordsIcon />
                  <span>
                    <Trans>1v1 rankings</Trans>
                  </span>
                </SidebarNavLink>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarNavLink
                  to="/{-$locale}/brawlhalla/rankings/2v2/{-$region}/{-$page}"
                  params={{ locale, region: "all", page: "1" }}
                  tooltip={t`2v2 rankings`}
                >
                  <UsersIcon />
                  <span>
                    <Trans>2v2 rankings</Trans>
                  </span>
                </SidebarNavLink>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </div>
      <SidebarRail />
    </Sidebar>
  )
}
