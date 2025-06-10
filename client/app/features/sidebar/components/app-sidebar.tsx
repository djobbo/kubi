import { t } from "@lingui/core/macro"
import { Link } from "@tanstack/react-router"
import type * as React from "react"

import { SafeImage } from "@/features/brawlhalla/components/Image"
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	useSidebar,
} from "@/ui/components/sidebar"
import { cn } from "@/ui/lib/utils"

import { NavBookmarks } from "./bookmarks"
import { MainNav } from "./main-nav"
import { NavUser } from "./user"

export const AppSidebar = ({
	...props
}: React.ComponentProps<typeof Sidebar>) => {
	const sidebar = useSidebar()

	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader className="h-12">
				<Link
					to="/"
					className={cn("flex items-center h-full", {
						"justify-center": sidebar.state === "collapsed",
					})}
				>
					{sidebar.state === "expanded" ? (
						<SafeImage
							src="/assets/images/brand/logos/logo-text.png"
							alt={t`Corehalla logo`}
							className="object-contain object-center h-6"
						/>
					) : (
						<>CH</>
					)}
				</Link>
			</SidebarHeader>
			<SidebarContent>
				<MainNav />
				<NavBookmarks />
			</SidebarContent>
			<SidebarFooter>
				<NavUser />
			</SidebarFooter>
		</Sidebar>
	)
}
