import { t } from "@lingui/core/macro"
import { Trans } from "@lingui/react/macro"
import type { QueryClient } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import {
  createRootRouteWithContext,
  Outlet,
  ScrollRestoration,
} from "@tanstack/react-router"
import { TanStackRouterDevtools } from "@tanstack/router-devtools"
import { Meta, Scripts } from "@tanstack/start"
import { KBarProvider } from "kbar"
import { type ReactNode } from "react"
import { Toaster } from "react-hot-toast"

import { AnimatedLogo } from "@/components/base/AnimatedLogo"
import { PageLoader } from "@/components/base/PageLoader"
import { Header } from "@/components/layout/Header"
import { getSession } from "@/features/auth/functions/getSession"
import { BackToTopButton } from "@/features/brawlhalla/components/BackToTopButton"
import { Layout } from "@/features/brawlhalla/components/layout/Layout"
import { Searchbox } from "@/features/brawlhalla/components/search/Searchbox"
import { SideNavProvider } from "@/features/sidenav/sidenav-provider"
// @ts-expect-error - CSS is not typed
import globalStyles from "@/global.css?url"
import { seo } from "@/helpers/seo"

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
          <Toaster />
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
// function RootComponent() {
//   return (
//     <RootDocument>
//       <div className="flex h-screen w-full flex-col bg-muted/40">
//         <Header />
//         <main className="flex h-[calc(100vh_-_theme(spacing.16))] flex-1 mx-1 mb-1">
//           <div className="hidden md:block w-60 flex-shrink-0 p-4">
//             <Trans>Sidenav</Trans>
//           </div>
//           <div className="flex-1 bg-background p-4 md:p-10 border rounded-lg overflow-scroll">
//             <Outlet />
//           </div>
//         </main>
//       </div>
//     </RootDocument>
//   )
// }

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html>
      <head>
        <Meta />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <TanStackRouterDevtools position="bottom-right" />
        <ReactQueryDevtools buttonPosition="bottom-left" />
        <Scripts />
      </body>
    </html>
  )
}
