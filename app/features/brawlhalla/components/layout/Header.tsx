import { useSideNav } from "@ctx/SideNavProvider"
import {
  SiDiscord as DiscordIcon,
  SiGithub as GithubIcon,
  SiX as TwitterIcon,
} from "@icons-pack/react-simple-icons"
import { t } from "@lingui/core/macro"
import { Trans } from "@lingui/react/macro"
import { Link, useRouterState } from "@tanstack/react-router"
import { Menu } from "lucide-react"

import { Button } from "@/components/base/Button"
import { useAuth } from "@/features/auth/use-auth"
import { Image } from "@/features/brawlhalla/components/Image"
import { cn } from "@/ui/lib/utils"

import { SearchButton, SearchButtonIcon } from "../search/SearchButton"
import { AlertBar } from "./AlertBar"

interface HeaderProps {
  className?: string
}

export const Header = ({ className }: HeaderProps) => {
  const { isLoggedIn, signIn, signOut, userProfile } = useAuth()
  const router = useRouterState()

  const { openSideNav } = useSideNav()

  const isLandingPage = router.location.pathname === "/"

  return (
    <>
      <AlertBar />
      <header className={cn({ "bg-bgVar2": !isLandingPage })}>
        <div
          className={cn(
            className,
            "flex items-center justify-between h-16 sm:h-20 px-4",
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
            <Link
              to="/"
              className="relative rounded-lg w-32 h-8 overflow-hidden"
            >
              <Image
                src="/assets/images/brand/logos/logo-text.png"
                alt={t`Corehalla logo`}
                className="object-contain object-center"
              />
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <SearchButton
              bg={isLandingPage ? "bg-bgVar2" : "bg-bgVar1"}
              className="hidden sm:flex mr-2"
            />
            {isLoggedIn ? (
              <>
                {userProfile && (
                  <>
                    <div className="relative ">
                      <Image
                        src={userProfile.avatarUrl}
                        alt={userProfile.username}
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
      </header>
    </>
  )
}
