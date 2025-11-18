import { LandingBackground } from '@/features/layout/components/landing-background'
import { Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/{-$locale}/_sidebar-layout')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <>
      <LandingBackground className="absolute top-0 left-0 w-full h-5/6 -z-10 opacity-50 pointer-events-none" />

      <main className="relative [grid-area:main] pr-1 pb-1 rounded-tl-2xl">
        <Outlet />
      </main>
    </>
  )
}
