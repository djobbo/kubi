import * as React from "react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/ui/components/sidebar"

import { NavBookmarks } from "./bookmarks"
import { MainNav } from "./main-nav"
import { NavUser } from "./user"

// const nav = [
//   {
//     title: "Rankings",
//     url: "#",
//     icon: SquareTerminal,
//     isActive: true,
//     items: [
//       {
//         title: "History",
//         url: "#",
//       },
//       {
//         title: "Starred",
//         url: "#",
//       },
//       {
//         title: "Settings",
//         url: "#",
//       },
//     ],
//   },
//   {
//     title: "Models",
//     url: "#",
//     icon: Bot,
//     items: [
//       {
//         title: "Genesis",
//         url: "#",
//       },
//       {
//         title: "Explorer",
//         url: "#",
//       },
//       {
//         title: "Quantum",
//         url: "#",
//       },
//     ],
//   },
//   {
//     title: "Documentation",
//     url: "#",
//     icon: BookOpen,
//     items: [
//       {
//         title: "Introduction",
//         url: "#",
//       },
//       {
//         title: "Get Started",
//         url: "#",
//       },
//       {
//         title: "Tutorials",
//         url: "#",
//       },
//       {
//         title: "Changelog",
//         url: "#",
//       },
//     ],
//   },
//   {
//     title: "Settings",
//     url: "#",
//     icon: Settings2,
//     items: [
//       {
//         title: "General",
//         url: "#",
//       },
//       {
//         title: "Team",
//         url: "#",
//       },
//       {
//         title: "Billing",
//         url: "#",
//       },
//       {
//         title: "Limits",
//         url: "#",
//       },
//     ],
//   },
// ]

export const AppSidebar = ({
  ...props
}: React.ComponentProps<typeof Sidebar>) => {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="flex h-12 justify-center p-4">
        {/* <Link to="/" className="flex items-center w-32 h-8 overflow-hidden">
          <Image
            src="/assets/images/brand/logos/logo-text.png"
            alt={t`Corehalla logo`}
            className="object-contain object-center"
          />
        </Link> */}
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
