import {
  SiDiscord as DiscordIcon,
  SiGithub as GithubIcon,
  SiX as TwitterIcon,
} from "@icons-pack/react-simple-icons"
import { t } from "@lingui/core/macro"
import { Trans } from "@lingui/react/macro"
import { Link } from "@tanstack/react-router"

import { useAuth } from "@/features/auth/use-auth"
import { Image } from "@/features/brawlhalla/components/Image"
import { Button } from "@/ui/components/button"
import { SidebarTrigger } from "@/ui/components/sidebar"
import { cn } from "@/ui/lib/utils"

import { SearchButton, SearchButtonIcon } from "../search/SearchButton"
import { AlertBar } from "./AlertBar"

interface HeaderProps {
  className?: string
}

export const Header = ({ className }: HeaderProps) => {
  const { isLoggedIn, logIn, logOut, user } = useAuth()

  return (
    <>
      <AlertBar />
      <div
        className={cn(
          className,
          "flex items-center justify-between h-[--header-height] px-4 gap-8",
        )}
      >
        <SidebarTrigger className="-ml-1" />
        <SearchButton className="hidden sm:flex mr-2 flex-1 max-w-96" />
        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <>
              {user?.avatarUrl && (
                <>
                  <div className="relative ">
                    <Image
                      src={user.avatarUrl}
                      alt={user.name ?? t`User avatar`}
                      containerClassName="rounded-lg w-8 h-8 overflow-hidden"
                      className="object-cover object-center"
                    />
                  </div>
                </>
              )}
              <Button onClick={logOut}>
                <Trans>Sign out</Trans>
              </Button>
            </>
          ) : (
            <Button onClick={logIn}>
              <DiscordIcon size="16" className="mr-2" />
              <Trans>Sign in</Trans>
            </Button>
          )}
          <SearchButtonIcon className="block sm:hidden px-2" size={22} />
          <div className="hidden md:flex items-center gap-1 ml-2">
            <Link
              className="text-textVar1 hover:text-text"
              to="/discord"
              target="_blank"
            >
              <DiscordIcon size="16" className="mr-2" />
            </Link>
            <Link
              className="text-textVar1 hover:text-text"
              to="/twitter"
              target="_blank"
            >
              <TwitterIcon size="16" className="mr-2" />
            </Link>
            <Link
              className="text-textVar1 hover:text-text"
              to="/github"
              target="_blank"
            >
              <GithubIcon size="16" className="mr-2" />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
