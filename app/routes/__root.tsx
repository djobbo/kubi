import {createRootRoute} from "@tanstack/react-router"
import {Outlet, ScrollRestoration} from "@tanstack/react-router"
import {Body, Head, Html, Meta, Scripts} from "@tanstack/start"
import * as React from "react"

import {getSession} from "@/features/auth/functions/getSession"
// @ts-expect-error - CSS is not typed
import globalStyles from "@/global.css?url"

export const Route = createRootRoute({
  meta: () => [
    {charSet: "utf-8"},
    {
      name: "viewport",
      content: "width=device-width, initial-scale=1",
    },
    {title: "TanStack Start Starter"},
  ],
  component: RootComponent,
  links: () => [{rel: "stylesheet", href: globalStyles}],
  beforeLoad: async () => {
    const session = await getSession()
    return {session}
  },
})

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  )
}

function RootDocument({children}: {children: React.ReactNode}) {
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
