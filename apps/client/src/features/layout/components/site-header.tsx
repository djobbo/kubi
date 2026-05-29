import { env } from "@/features/config/env";
import { SiteNavMenu } from "@/features/layout/components/site-nav-menu";
import { SearchButton, SearchButtonIcon } from "@/features/search/components/search-button";
import { DiscordIcon, GithubIcon, TwitterIcon } from "@/shared/components/social-icons";
import { SafeImage } from "@/shared/components/image";
import { SidebarTrigger } from "@/shared/components/sidebar";
import { cn } from "@dair/common/src/helpers/ui";
import { Link, useParams } from "@tanstack/react-router";

const socialLinks = [
  { href: env.VITE_SOCIAL_DISCORD_URL, label: "Discord", Icon: DiscordIcon },
  { href: env.VITE_SOCIAL_TWITTER_URL, label: "Twitter", Icon: TwitterIcon },
  { href: env.VITE_SOCIAL_GITHUB_URL, label: "GitHub", Icon: GithubIcon },
] as const;

export function SiteHeader({ className }: { className?: string }) {
  const { locale } = useParams({ strict: false });

  return (
    <header
      className={cn(
        "flex h-(--header-height) shrink-0 items-center border-b border-border px-4",
        className,
      )}
    >
      <div className="flex w-full items-center justify-between gap-4">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <SidebarTrigger className="-ml-1 md:hidden" />
          <div className="h-4 w-px bg-border md:hidden" />
          <Link
            to="/{-$locale}"
            params={{ locale }}
            className="relative block h-8 w-32 shrink-0 overflow-hidden corner-smooth-lg"
          >
            <SafeImage
              src="/assets/images/brand/logos/logo-text.png"
              alt="dair.gg"
              className="size-full object-contain object-center"
              Container={null}
            />
          </Link>
          <SiteNavMenu />
        </div>

        <div className="flex items-center gap-2">
          <SearchButton className="mr-2 hidden sm:flex" />
          <SearchButtonIcon className="block sm:hidden" />
          <div className="ml-2 hidden items-center gap-1 md:flex">
            {socialLinks.map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="flex size-8 items-center justify-center corner-smooth-md text-text-muted hover:bg-bg-light hover:text-text"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
