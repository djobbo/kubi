import { Link, useRouterState } from "@tanstack/react-router"

import { Logo } from "@/components/layout/Logo"
import { navConfig } from "@/config/nav"
import { siteConfig } from "@/config/site"
import { cn } from "@/ui/lib/utils"

export function MainNav() {
  const router = useRouterState()
  const pathname = router.location.pathname

  return (
    <div className="mr-4 hidden md:flex">
      <Link to="/" className="mr-4 flex items-center space-x-2 lg:mr-6">
        <Logo className="h-6 w-6" />
        <span className="hidden font-bold lg:inline-block">
          {siteConfig.name}
        </span>
      </Link>
      <nav className="flex items-center gap-4 text-sm lg:gap-6">
        {navConfig.main.map((link) => (
          <Link
            to={link.to}
            className={cn(
              "transition-colors hover:text-foreground/80",
              link.isActive(pathname, link.to)
                ? "text-foreground"
                : "text-foreground/60",
            )}
            key={link.name()}
          >
            {link.name}
          </Link>
        ))}
      </nav>
    </div>
  )
}
