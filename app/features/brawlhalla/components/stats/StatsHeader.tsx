import { SiDiscord as DiscordIcon } from "@icons-pack/react-simple-icons"
import { t } from "@lingui/core/macro"
import { Trans } from "@lingui/react/macro"
import { ExternalLink, UserRoundMinus, UserRoundPlus } from "lucide-react"
import type { ReactNode } from "react"
import toast from "react-hot-toast"

import type { Bookmark } from "@/db/schema"
import { AdsenseStatsHeader } from "@/features/analytics/components/adsense"
import { useAuth } from "@/features/auth/use-auth"
import { useBookmarks } from "@/features/bookmarks/use-bookmarks"
import { cleanString } from "@/helpers/cleanString"
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard"
import { Button } from "@/ui/components/button"
import { cn } from "@/ui/lib/utils"

import type { MiscStat } from "./MiscStatGroup"
import { MiscStatGroup } from "./MiscStatGroup"

interface StatsHeaderProps {
  name: string
  id: number
  icon?: ReactNode
  aliases?: string[]
  miscStats?: MiscStat[]
  bookmark?: Bookmark
}

export const StatsHeader = ({
  name,
  id,
  icon,
  aliases,
  miscStats,
  bookmark,
}: StatsHeaderProps) => {
  const { isLoggedIn, logIn } = useAuth()
  const { addBookmark, isBookmarked, deleteBookmark } = useBookmarks()
  const copyToClipboard = useCopyToClipboard()

  const isItemFavorite = bookmark && isBookmarked(bookmark)

  return (
    <>
      <div
        className="w-full h-28 max-h-28 relative rounded-md overflow-hidden shadow-md"
        style={{
          background:
            "url(/assets/images/brand/backgrounds/background-text-sm.jpg)",
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      >
        <AdsenseStatsHeader />
      </div>
      <div className="flex flex-col sm:flex-row justify-end py-2 gap-2">
        {isLoggedIn ? (
          bookmark && (
            <Button
              variant={isItemFavorite ? "outline" : "primary"}
              onClick={() => {
                if (isItemFavorite) return deleteBookmark(bookmark)
                addBookmark(bookmark)
              }}
            >
              {isItemFavorite ? (
                <>
                  <Trans>Remove Favorite</Trans>
                  <UserRoundMinus className="ml-2 w-4 h-4" />
                </>
              ) : (
                <>
                  <Trans>Add favorite</Trans>
                  <UserRoundPlus className="ml-2 w-4 h-4" />
                </>
              )}
            </Button>
          )
        ) : (
          <Button onClick={logIn}>
            <DiscordIcon size="16" className="mr-2" />{" "}
            <Trans>Sign in to add favorites</Trans>
          </Button>
        )}
        <Button
          variant="outline"
          onClick={() => {
            copyToClipboard(window.location.href)
            toast(t`Copied link to clipboard!`, {
              icon: "📋",
            })
          }}
        >
          <ExternalLink size="16" className="mr-2" /> <Trans>Share</Trans>
        </Button>
      </div>
      <div
        className={cn("flex flex-col justify-center items-center", {
          "mt-8": !bookmark,
          "mt-4": !!bookmark,
        })}
      >
        <h1 className="font-bold text-3xl lg:text-5xl flex items-center">
          {icon}
          {name}
        </h1>
        <span className="text-xs font-bold mt-1 text-textVar1">#{id}</span>
      </div>
      {!!aliases && aliases.length > 1 && (
        <div className="flex flex-wrap gap-2 mt-4 justify-center">
          {aliases.map((alias) => (
            <p key={alias} className={cn("rounded-lg py-0.5 px-3 bg-bg")}>
              {cleanString(alias)}
            </p>
          ))}
        </div>
      )}
      {miscStats && (
        <MiscStatGroup
          className="mt-8 justify-items-center text-center"
          fit="fit"
          stats={miscStats}
        />
      )}
    </>
  )
}
