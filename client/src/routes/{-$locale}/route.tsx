import { env } from "@/features/config/env"
import { activateLocale } from "@/features/i18n/activate-locale"
import { LocalesProvider } from "@/features/i18n/locales-provider"
import { SEO } from "@dair/common/src/helpers/seo"
import { t } from "@lingui/core/macro"
import { createFileRoute, Outlet } from "@tanstack/react-router"
import linguiConfig from "~/lingui.config"

export const Route = createFileRoute("/{-$locale}")({
  component: RouteComponent,
  head: async ({ params }) => {
    const locale = params.locale ?? linguiConfig.sourceLocale
    await activateLocale(locale)

    return {
      meta: [
        {
          property: "og:locale",
          content: locale,
        },
      ],
      links: [
        {
          rel: "canonical",
          href: env.VITE_CLIENT_URL,
        },
        ...linguiConfig.locales.map((locale) => ({
          rel: "alternate",
          hrefLang: locale,
          href: `${env.VITE_CLIENT_URL}/${locale}`,
        })),
      ],
    }
  },
})

function RouteComponent() {
  return (
    <LocalesProvider>
      <SEO
        title={t`Track your Brawlhalla stats, view rankings, and more! • Corehalla`}
        description={t`Improve your Brawlhalla Game, and find your place among the Elite with our in-depth Player and Clan stats tracking and live leaderboards.`}
        image="/assets/images/og/main-og.jpg"
      />
      <Outlet />
    </LocalesProvider>
  )
}
