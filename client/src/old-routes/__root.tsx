import {
	HeadContent,
	Outlet,
	Scripts,
	createFileRoute,
	createRootRouteWithContext,
} from "@tanstack/react-router"
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools"

import TanStackQueryLayout from "../integrations/tanstack-query/layout.tsx"

import styles from "../styles.css?url"

import { t } from "@lingui/core/macro"
import { Trans } from "@lingui/react/macro"
import { KBarProvider } from "kbar"

import { AnimatedLogo } from "@/components/base/AnimatedLogo"
import { PageLoader } from "@/components/base/PageLoader"
import { BackToTopButton } from "@/features/brawlhalla/components/BackToTopButton"
import { Layout } from "@/features/brawlhalla/components/layout/Layout"
import { Searchbox } from "@/features/brawlhalla/components/search/Searchbox"
import { SideNavProvider } from "@/features/sidebar/sidenav-provider"
import { Toaster } from "@/features/toaster/index.tsx"
import { activateLocale } from "@/locales/activate"
import type { RouterContext } from "@/router.tsx"
import { SidebarProvider } from "@/ui/components/sidebar"
import { seo } from "@dair/common/src/helpers/seo"

export const Route = createRootRouteWithContext<RouterContext>(
	"/old-routes/__root",
)({
	loader: async ({ context: { apiClient } }) => {
		const session = await apiClient.auth
			.getSession({
				query: {},
			})
			.then((res) => res.json())
			.then((res) => res.data.session)
			.catch(() => null)
		return {
			lang: "en",
			session,
		}
	},
	head: ({ loaderData }) => {
		const { lang } = loaderData ?? {}
		activateLocale(lang)

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
				{ rel: "stylesheet", href: styles },
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
	component: RootComponent,
})

function RootComponent() {
	return (
		<RootDocument>
			{/* TODO: GAscripts */}
			{/* <GAScripts /> */}
			<SidebarProvider>
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
			</SidebarProvider>
			<TanStackQueryLayout />
			<TanStackRouterDevtools />
		</RootDocument>
	)
}

function RootDocument({ children }: { children: React.ReactNode }) {
	const { lang } = Route.useLoaderData()
	return (
		<html lang={lang}>
			<head>
				<HeadContent />
			</head>
			<body>
				{children}
				<div
					style={{
						opacity: 0.02,
						backgroundSize: "128px",
						backgroundRepeat: "repeat",
						backgroundImage: "url(/assets/images/grain.png)",
						zIndex: 999,
					}}
					className="fixed inset-0 w-full h-full pointer-events-none"
				/>
				<Scripts />
			</body>
		</html>
	)
}
