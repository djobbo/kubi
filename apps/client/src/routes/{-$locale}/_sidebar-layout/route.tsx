import { LandingBackground } from "@/features/layout/components/landing-background"
import { SearchButton } from "@/features/search/components/search-button"
import { breadCrumbContainerAtom } from "@/shared/components/breadcrumb"
import { cx } from "@dair/common/src/helpers/ui"
import { useAtomSet } from "@effect/atom-react"
import { Link, Outlet, createFileRoute } from "@tanstack/react-router"
import { Trans } from "@lingui/react/macro"
import * as layoutStyles from "./-layout.css.ts"

export const Route = createFileRoute("/{-$locale}/_sidebar-layout")({
  component: RouteComponent,
})

function RouteComponent() {
  const setBreadCrumbContainer = useAtomSet(breadCrumbContainerAtom)

  return (
    <div className={layoutStyles.layout}>
      <LandingBackground
        className={cx(
          layoutStyles.background,
          "-z-10 opacity-50 pointer-events-none",
        )}
      />
      <header
        className={cx(
          layoutStyles.header,
          "flex items-center justify-between gap-4 px-4",
          "border-b border-border",
        )}
      >
        <Link to="/" className="text-sm font-semibold tracking-tight">
          dair.gg
        </Link>
        <nav className="flex items-center gap-4 text-sm text-text-muted">
          <Link
            to="/brawlhalla/rankings/1v1/$region/$page"
            params={{ region: "all", page: "1" }}
            className="hover:text-text"
          >
            <Trans>Rankings</Trans>
          </Link>
        </nav>
        <SearchButton />
      </header>
      <div
        className={cx(
          layoutStyles.sidebar,
          "flex flex-col gap-2 p-4",
          "border-r border-border text-sm",
        )}
      >
        <Link to="/" className="hover:text-text text-text-muted">
          <Trans>Home</Trans>
        </Link>
        <Link
          to="/brawlhalla/rankings/1v1/$region/$page"
          params={{ region: "all", page: "1" }}
          className="hover:text-text text-text-muted"
        >
          <Trans>1v1 rankings</Trans>
        </Link>
        <Link
          to="/brawlhalla/rankings/2v2/$region/$page"
          params={{ region: "all", page: "1" }}
          className="hover:text-text text-text-muted"
        >
          <Trans>2v2 rankings</Trans>
        </Link>
      </div>
      <main className={cx(layoutStyles.main, "p-4")}>
        <div ref={setBreadCrumbContainer} className="text-sm text-text-muted" />
        <Outlet />
      </main>
    </div>
  )
}
