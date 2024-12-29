import {
  SiDiscord as DiscordIcon,
  SiGithub as GithubIcon,
  SiX as TwitterIcon,
} from "@icons-pack/react-simple-icons"
import { t } from "@lingui/core/macro"
import { Trans } from "@lingui/react/macro"
import { Link } from "@tanstack/react-router"
import { Menu } from "lucide-react"

import { useAuth } from "@/features/auth/use-auth"
import { Image } from "@/features/brawlhalla/components/Image"
import { useSideNav } from "@/features/sidenav/sidenav-provider"
import { Button } from "@/ui/components/button"
import { cn } from "@/ui/lib/utils"

import { SearchButton, SearchButtonIcon } from "../search/SearchButton"
import { AlertBar } from "./AlertBar"

interface HeaderProps {
  className?: string
}

export const Header = ({ className }: HeaderProps) => {
  const { isLoggedIn, signIn, signOut, user } = useAuth()

  const { openSideNav } = useSideNav()

  return (
    <>
      <AlertBar />
      <div
        className={cn(
          className,
          "flex items-center justify-between h-16 px-4 gap-8",
        )}
      >
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="block sm:hidden"
            onClick={() => {
              openSideNav()
            }}
          >
            <Menu size={24} />
          </button>
          <Link to="/" className="flex items-center w-32 h-8 overflow-hidden">
            <Image
              src="/assets/images/brand/logos/logo-text.png"
              alt={t`Corehalla logo`}
              className="object-contain object-center"
            />
          </Link>
        </div>
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
              <Button onClick={signOut}>
                <Trans>Sign out</Trans>
              </Button>
            </>
          ) : (
            <Button onClick={signIn}>
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
