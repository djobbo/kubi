import { t } from "@lingui/core/macro"
import { Trans } from "@lingui/react/macro"
import type { QueryClient } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import {
  createRootRouteWithContext,
  Outlet,
  ScrollRestoration,
} from "@tanstack/react-router"
import { Meta, Scripts } from "@tanstack/start"
import { KBarProvider } from "kbar"
import { lazy, type ReactNode, Suspense } from "react"

import { AnimatedLogo } from "@/components/base/AnimatedLogo"
import { PageLoader } from "@/components/base/PageLoader"
import { getSession } from "@/features/auth/functions/getSession"
import { BackToTopButton } from "@/features/brawlhalla/components/BackToTopButton"
import { Layout } from "@/features/brawlhalla/components/layout/Layout"
import { Searchbox } from "@/features/brawlhalla/components/search/Searchbox"
import { SideNavProvider } from "@/features/sidenav/sidenav-provider"
import globalStyles from "@/global.css?url"
import { seo } from "@/helpers/seo"

const Toaster = lazy(() =>
  // Lazy load in development
  import("react-hot-toast").then((res) => ({
    default: res.Toaster,
  })),
)

const TanStackRouterDevtools =
  process.env.NODE_ENV === "production"
    ? () => null // Render nothing in production
    : lazy(() =>
        // Lazy load in development
        import("@tanstack/router-devtools").then((res) => ({
          default: res.TanStackRouterDevtools,
        })),
      )

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
  {
    beforeLoad: async () => {
      const session = await getSession()
      return { session }
    },
    loader: async ({ context: { session } }) => {
      return {
        session,
      }
    },
    component: RootComponent,
    head: () => {
      return {
        meta: [
          { charSet: "utf-8" },
          {
            name: "viewport",
            // eslint-disable-next-line lingui/no-unlocalized-strings
            content: "width=device-width, initial-scale=1",
          },
          { name: "theme-color", content: "#ffffff" },
          ...seo({
            title: t`Track your Brawlhalla stats, view rankings, and more! • Corehalla`,
            description: t`Improve your Brawlhalla Game, and find your place among the Elite with our in-depth Player and Clan stats tracking and live leaderboards.`,
            image: "/assets/images/og/main-og.jpg",
          }),
        ],
        links: [
          { rel: "stylesheet", href: globalStyles },
          { rel: "preconnect", href: "https://fonts.googleapis.com" },
          {
            rel: "preconnect",
            href: "https://fonts.gstatic.com",
            crossOrigin: "anonymous",
          },
          {
            rel: "stylesheet",
            href: "https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap",
          },
          { rel: "icon", type: "image/png", href: "/favicon.png" },
          {
            rel: "apple-touch-icon",
            href: "/apple-touch-icon.png",
            sizes: "180x180",
          },
          { rel: "mask-icon", href: "/mask-icon.svg", color: "#ffffff" },
        ],
      }
    },
  },
)

function RootComponent() {
  return (
    <RootDocument>
      {/* TODO: GAscripts */}
      {/* <GAScripts /> */}
      <KBarProvider actions={[]} options={{}}>
        <SideNavProvider>
          <PageLoader>
            <div className="flex items-center gap-4">
              <span className="text-sm">
                <Trans>Loading...</Trans>
              </span>
              <AnimatedLogo size={32} />
            </div>
          </PageLoader>
          <Suspense>
            <Toaster />
          </Suspense>
          <Layout>
            <Outlet />
          </Layout>
          <Searchbox />
          <BackToTopButton />
        </SideNavProvider>
      </KBarProvider>
    </RootDocument>
  )
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html>
      <head>
        <Meta />
      </head>
      <body className="dark">
        {children}
        <ScrollRestoration />
        <ReactQueryDevtools buttonPosition="bottom-left" />
        <Suspense>
          <TanStackRouterDevtools position="bottom-right" />
        </Suspense>
        <Scripts />
      </body>
    </html>
  )
}
