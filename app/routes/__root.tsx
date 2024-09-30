import { createRootRoute, Link } from "@tanstack/react-router"
import { Outlet, ScrollRestoration } from "@tanstack/react-router"
import { Body, Head, Html, Meta, Scripts } from "@tanstack/start"
import type { ComponentPropsWithoutRef, ElementRef } from "react"
import { forwardRef, type ReactNode } from "react"

import { Header } from "@/components/layout/Header"
import { getSession } from "@/features/auth/functions/getSession"
// @ts-expect-error - CSS is not typed
import globalStyles from "@/global.css?url"
import { NavigationMenuLink } from "@/ui/components/navigation-menu"
import { cn } from "@/ui/lib/utils"

export const Route = createRootRoute({
  meta: () => [
    { charSet: "utf-8" },
    {
      name: "viewport",
      content: "width=device-width, initial-scale=1",
    },
    { title: "TanStack Start Starter" },
    { name: "description", content: "A starter for TanStack Start" },
    { name: "theme-color", content: "#ffffff" },
  ],
  component: RootComponent,
  links: () => [
    { rel: "stylesheet", href: globalStyles },
    { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
    {
      rel: "apple-touch-icon",
      href: "/apple-touch-icon.png",
      sizes: "180x180",
    },
    { rel: "mask-icon", href: "/mask-icon.svg", color: "#ffffff" },
  ],
  beforeLoad: async () => {
    const session = await getSession()
    return { session }
  },
})

const ListItem = forwardRef<
  ElementRef<"a">,
  ComponentPropsWithoutRef<typeof Link>
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className,
          )}
          {...props}
        >
          {(state) => (
            <>
              <div className="text-sm font-medium leading-none">{title}</div>
              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                {typeof children === "function" ? children(state) : children}
              </p>
            </>
          )}
        </Link>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"

function RootComponent() {
  return (
    <RootDocument>
      <div className="flex h-screen w-full flex-col bg-muted/40">
        <Header />
        <main className="flex h-[calc(100vh_-_theme(spacing.16))] flex-1 mx-1 mb-1">
          <div className="hidden md:block w-60 flex-shrink-0 p-4">Sidenav</div>
          <div className="flex-1 bg-background p-4 md:p-10 border rounded-lg overflow-scroll">
            <Outlet />
          </div>
        </main>
      </div>
    </RootDocument>
  )
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <Html>
      <Head>
        <Meta />
      </Head>
      <Body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </Body>
    </Html>
  )
}
