import { Trans } from "@lingui/react/macro"
import { Star, StarOff } from "lucide-react"

import { useAuth } from "@/features/auth/use-auth"
import { useBookmark } from "@/features/bookmarks/hooks/use-bookmark"
import { LegendIcon } from "@/features/brawlhalla/components/Image"
import { cleanString } from "@/helpers/cleanString"

import type { Ranking1v1 } from "../../api/schema/rankings"
import { legendsMap } from "../../constants/legends"
import { SearchboxItem } from "./SearchboxItem"

interface RankedPlayerItemProps {
  player: Ranking1v1
}

export const RankedPlayerItem = ({ player }: RankedPlayerItemProps) => {
  const { isLoggedIn } = useAuth()
  const legend = legendsMap[player.best_legend]

  const { isBookmarked, toggleBookmark } = useBookmark({
    pageType: "player_stats",
    pageId: player.brawlhalla_id.toString(),
    name: player.name,
    meta: {
      version: "1",
      data: {
        icon: {
          type: "legend",
          id: legend?.legend_id,
        },
      },
    },
  })

  const icon = legend && (
    <LegendIcon
      legendNameKey={legend.legend_name_key}
      alt={legend.bio_name}
      containerClassName="w-8 h-8 rounded-lg overflow-hidden border border-muted-foreground"
      className="object-contain object-center"
    />
  )

  const { rating, peak_rating, tier } = player

  return (
    <SearchboxItem
      icon={icon}
      href={`/stats/player/${player.brawlhalla_id}`}
      title={cleanString(player.name)}
      subtitle={
        <Trans>
          {rating} / {peak_rating} peak ({tier})
        </Trans>
      }
      rightContent={
        isLoggedIn && (
          <button
            type="button"
            className="cursor-pointer"
            onClick={(e) => {
              if (!isLoggedIn) return

              e.preventDefault()
              e.stopPropagation()

              toggleBookmark(!isBookmarked)
            }}
          >
            {isBookmarked ? <StarOff size={16} /> : <Star size={16} />}
          </button>
        )
      }
    />
  )
}
