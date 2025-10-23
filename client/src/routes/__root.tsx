import {
	HeadContent,
	Outlet,
	Scripts,
	createRootRouteWithContext,
} from "@tanstack/react-router"
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools"

import TanStackQueryLayout from "@/integrations/tanstack-query/layout"

import styles from "@/styles.css?url"

import { SiteHeader } from "@/components/layout/header"
import { LandingBackground } from "@/features/brawlhalla/components/layout/LandingBackground"
import { AppSidebar } from "@/features/sidebar/components/app-sidebar"
import { activateLocale } from "@/locales/activate"
import type { RouterContext } from "@/router.tsx"
import { SidebarInset, SidebarProvider } from "@/ui/components/sidebar"
import { seo } from "@dair/common/src/helpers/seo"
import { t } from "@lingui/core/macro"

export const Route = createRootRouteWithContext<RouterContext>()({
	loader: async ({ context: { apiClient } }) => {
		// const session = await apiClient.auth
		// 	.getSession({
		// 		query: {},
		// 	})
		// 	.then((res) => res.json())
		// 	.then((res) => res.data.session)
		// 	.catch(() => null)
		return {
			lang: "en",
			session: null,
		}
	},
	staleTime: Number.POSITIVE_INFINITY,
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
			<SidebarProvider
				style={
					{
						"--sidebar-width": "calc(var(--spacing) * 72)",
						"--header-height": "calc(var(--spacing) * 12)",
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
			<body className="dark">
				{children}
				<div
					style={{
						opacity: 0.01,
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
