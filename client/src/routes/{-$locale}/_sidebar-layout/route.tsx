import { LandingBackground } from '@/features/layout/components/landing-background'
import { Outlet, createFileRoute } from '@tanstack/react-router'
import * as layoutStyles from './-layout.css.ts'
import { cx } from '@dair/common/src/helpers/ui'
import { useAtomSet } from '@effect-atom/atom-react'
import { breadCrumbContainerAtom } from '@/shared/components/breadcrumb'

export const Route = createFileRoute('/{-$locale}/_sidebar-layout')({
  component: RouteComponent,
})

function RouteComponent() {
  const setBreadCrumbContainer = useAtomSet(breadCrumbContainerAtom)

  return (
    <div className={layoutStyles.layout}>
      <LandingBackground
        className={cx(
          layoutStyles.background,
          '-z-10 opacity-50 pointer-events-none',
        )}
      />
      <header
        className={cx(
          layoutStyles.header,
          'flex items-center justify-between px-4',
          'border-b border-border',
        )}
      >
        <h1>Header</h1>
      </header>
      <div
        className={cx(layoutStyles.sidebar, 'p-4', 'border-r border-border')}
      >
        <h1>Sidebar</h1>
      </div>
      <main className={cx(layoutStyles.main, 'p-4')}>
        <div ref={setBreadCrumbContainer} className="text-sm text-text-muted" />
        <Outlet />
      </main>
    </div>
  )
}
