import { SiDiscord as DiscordIcon } from "@icons-pack/react-simple-icons"
import { Trans } from "@lingui/react/macro"
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { ArrowRight } from "lucide-react"
import { Suspense } from "react"

import { useAuth } from "@/features/auth/use-auth"
import { useBookmarks } from "@/features/bookmarks/use-bookmarks"
import { DiscordCard } from "@/features/brawlhalla/components/DiscordCard"
import { FavoritesGrid } from "@/features/brawlhalla/components/favorites/FavoritesGrid"
import { LandingArticles } from "@/features/brawlhalla/components/LandingArticles"
import { SearchButton } from "@/features/brawlhalla/components/search/SearchButton"
import { WeeklyRotation } from "@/features/brawlhalla/components/WeeklyRotation"
import { css } from "@/panda/css"
import { Button } from "@/ui/components/button"
import { cn } from "@/ui/lib/utils"

export const Route = createFileRoute("/")({
  component: Home,
})

const landingClassName = css({
  height: "60vh",
  minHeight: "400px",
})

function Home() {
  const { isLoggedIn, logIn } = useAuth()
  const { bookmarks } = useBookmarks()
  const navigate = useNavigate()

  return (
    <>
      <div className="flex flex-col items-center justify-center lg:gap-16 lg:flex-row">
        <div
          className={cn(
            "relative flex flex-col justify-center items-center lg:items-start z-0",
            landingClassName,
            'after:content[""] after:absolute after:inset-0 after:bg-accentOld after:blur-[256px] after:opacity-[0.08] after:-z-10',
          )}
        >
          <a
            href="/discord"
            target="_blank"
            className="flex items-center gap-2 pl-3 pr-2 py-1 bg-bgVar1/75 rounded-full border border-bg text-sm hover:bg-bgVar2"
            aria-label='Join our "Corehalla" Discord server'
          >
            <span className="border-r border-r-bg pr-2">
              <Trans>Join our community</Trans>
            </span>
            <span className="flex items-center gap-1 font-semibold text-center bg-gradient-to-l from-accentOld to-accentVar1 bg-clip-text text-fill-none">
              <Trans>Discord</Trans>
              <ArrowRight className="w-4 h-4" />
            </span>
          </a>
          <h1
            className={cn(
              "text-center text-5xl sm:text-6xl font-bold mt-6 max-w-5xl",
              "lg:text-start lg:max-w-3xl",
            )}
          >
            <Trans>
              Stay ahead of <br />
              the competition
            </Trans>
          </h1>
          <p
            className={cn(
              "text-center text-sm sm:text-base mt-3 text-textVar1 max-w-xl ",
              "lg:text-start",
            )}
          >
            <Trans>
              Improve your Brawlhalla Game, and find your place among the Elite
              with our in-depth stats tracking and live leaderboards.
            </Trans>
          </p>
          <div className="mt-8 flex items-center gap-3 sm:gap-6 flex-col sm:flex-row">
            <SearchButton />
            {/* <CommandMenu title={t`Search player...`} /> */}
            <span className="text-textVar1 text-sm sm:text-base">or</span>
            <div className="flex items-center gap-2">
              <Button asChild className="whitespace-nowrap font-semibold">
                <Link to="/rankings/1v1/$">
                  <Trans>View rankings</Trans>
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="whitespace-nowrap font-semibold"
              >
                <Link to="/rankings/2v2/$">
                  <Trans>2v2</Trans>
                </Link>
              </Button>
            </div>
          </div>
        </div>
        <div>
          <DiscordCard />
          <a
            href="/discord"
            target="_blank"
            aria-label="Discord server link"
            className="block text-sm mt-2 text-textVar1 text-center"
          >
            corehalla.com/discord
          </a>
        </div>
      </div>
      <div className="border border-bg border-dashed p-4 rounded-lg my-16">
        {bookmarks.length > 0 ? (
          <FavoritesGrid bookmarks={bookmarks} />
        ) : (
          <p className="flex flex-col items-center gap-4 py-4">
            {isLoggedIn ? (
              <>
                <Trans>
                  You don&apos;t have any favorites yet, you can a player or a
                  clan as favorite when visiting their profile page.
                </Trans>
                <Button
                  onClick={() => {
                    navigate({ to: "/rankings/1v1/$" })
                  }}
                >
                  <Trans>View rankings</Trans>
                </Button>
              </>
            ) : (
              <>
                <span className="text-textVar1">
                  <Trans>
                    Here you{"'"}ll be able to see your favorite players and
                    clans
                  </Trans>
                </span>
                <Button onClick={logIn} className="mt-2">
                  <DiscordIcon size="16" className="mr-2" />
                  <Trans>Sign in</Trans>
                </Button>
              </>
            )}
          </p>
        )}
      </div>
      <Suspense
        fallback={
          <Trans>
            Loading
            <span className="animate-pulse">...</span>
          </Trans>
        }
      >
        <WeeklyRotation />
      </Suspense>
      <Suspense
        fallback={
          <Trans>
            Loading
            <span className="animate-pulse">...</span>
          </Trans>
        }
      >
        <LandingArticles />
      </Suspense>
    </>
  )
}
