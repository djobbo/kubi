import type { ReactNode } from "react"

import { FirstTimePopup } from "@/features/brawlhalla/components/FirstTimePopup"
import { AppSidebar } from "@/features/sidebar/components/app-sidebar"
import { css } from "@/panda/css"
import { useSidebar } from "@/ui/components/sidebar"
import { cn } from "@/ui/lib/utils"
import { colors } from "@/ui/theme"

import { Footer } from "./Footer"
import { Header } from "./Header"
import { LandingBackground } from "./LandingBackground"

export interface LayoutProps {
	children: ReactNode
}

const backgroundContainerClass = css({
	"& > svg": {
		maskImage: `linear-gradient(0deg, ${colors.background}00 0%, ${colors.background} 40%)`,
	},
})

export const Layout = ({ children }: LayoutProps) => {
	const sidebar = useSidebar()

	return (
		<>
			<header
				className={cn(
					"fixed top-0 right-0 left-0 h-[--header-height] bg-secondary z-10",
					"duration-100 transition-[left,right,width] ease-linear",
					{
						"md:left-[--sidebar-width]": sidebar.state === "expanded",
						"md:left-[--sidebar-width-icon]": sidebar.state === "collapsed",
					},
				)}
			>
				<Header />
			</header>
			<div className="fixed bottom-0 left-0 right-0 h-1 bg-secondary z-10" />
			<AppSidebar />
			<div
				className={cn(
					"pointer-events-none fixed border border-border/75 rounded-lg top-[--header-height] bottom-1 right-1 z-50",
					"duration-100 transition-[left,right,width] ease-linear",
					{
						"md:left-[--sidebar-width]": sidebar.state === "expanded",
						"md:left-[--sidebar-width-icon]": sidebar.state === "collapsed",
					},
				)}
			/>
			<div
				className={cn(
					"pointer-events-none fixed border-4 border-secondary rounded-xl top-[--header-height] bottom-1 -m-1 right-1 z-2",
					"duration-100 transition-[left,right,width] ease-linear",
					{
						"md:left-[--sidebar-width]": sidebar.state === "expanded",
						"md:left-[--sidebar-width-icon]": sidebar.state === "collapsed",
					},
				)}
			/>
			<div
				className={cn(
					"pointer-events-none fixed border border-border/75 rounded-lg top-[--header-height] bottom-1 right-1 bg-background",
					"duration-100 transition-[left,right,width] ease-linear",
					{
						"md:left-[--sidebar-width]": sidebar.state === "expanded",
						"md:left-[--sidebar-width-icon]": sidebar.state === "collapsed",
					},
				)}
			/>
			<div className="relative w-full mt-[--header-height] mr-1">
				<div
					className={cn(
						backgroundContainerClass,
						"w-full h-screen absolute pointer-events-none",
					)}
				>
					<LandingBackground className="w-full h-5/6" />
				</div>
				<div className="relative p-8">
					<div className="w-full max-w-screen-xl mx-auto">{children}</div>
				</div>
				<Footer className="relative mt-16" />
			</div>
			<FirstTimePopup />
		</>
	)
}
