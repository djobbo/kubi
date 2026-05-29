import { AppSidebar } from "@/features/layout/components/app-sidebar"
import { SiteHeader } from "@/features/layout/components/site-header"
import { breadCrumbContainerAtom } from "@/shared/components/breadcrumb"
import { SidebarInset, SidebarProvider } from "@/shared/components/sidebar"
import { useIsMobile } from "@/shared/hooks/use-is-mobile"
import { useAtomSet } from "@effect/atom-react"
import { createFileRoute, Outlet } from "@tanstack/react-router"

export const Route = createFileRoute("/{-$locale}/_sidebar-layout")({
  component: RouteComponent,
})

function RouteComponent() {
  const setBreadCrumbContainer = useAtomSet(breadCrumbContainerAtom)
  const isMobile = useIsMobile()

  return (
    <SidebarProvider defaultOpen={false} open={isMobile ? undefined : false}>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div
            ref={setBreadCrumbContainer}
            className="text-sm text-text-muted empty:hidden"
          />
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
