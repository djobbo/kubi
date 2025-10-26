import { createFileRoute, Outlet } from '@tanstack/react-router'
import { SiteHeader } from "@/components/layout/header"
import { LandingBackground } from "@/features/brawlhalla/components/layout/LandingBackground"
import { AppSidebar } from "@/features/sidebar/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/ui/components/sidebar"

export const Route = createFileRoute('/_sidenav-layout')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
			<SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 10)",
        } as React.CSSProperties
      }
      defaultOpen={false}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="@container/main flex flex-1 flex-col gap-2 py-4 md:py-6">
          <div className="px-4 lg:px-6 w-full max-w-7xl mx-auto z-0">
            <LandingBackground className="absolute top-0 left-0 w-full h-5/6 -z-10 opacity-50 pointer-events-none" />
            <Outlet />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
