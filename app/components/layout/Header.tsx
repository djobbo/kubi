import { t } from "@lingui/core/macro"
import { Link } from "@tanstack/react-router"

import { MainNav } from "@/components/layout/MainNav"
import { MobileNav } from "@/components/layout/MobileNav"
import { siteConfig } from "@/config/site"
import { CommandMenu } from "@/features/command/components/CommandMenu"
import { buttonVariants } from "@/ui/components/button"
import { cn } from "@/ui/lib/utils"

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-border/40">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <MainNav />
        <MobileNav />
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <CommandMenu title={t`Search player...`} keyboardShortcut />
          </div>
          <nav className="flex items-center">
            {siteConfig.social.map((socialLink) => (
              <Link
                to={socialLink.href}
                target="_blank"
                rel="noreferrer"
                key={socialLink.title}
              >
                <div
                  className={cn(
                    buttonVariants({ variant: "ghost" }),
                    "h-8 w-8 px-0",
                  )}
                >
                  <socialLink.Icon className="h-4 w-4" />
                  <span className="sr-only">{socialLink.title}</span>
                </div>
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  )
}
