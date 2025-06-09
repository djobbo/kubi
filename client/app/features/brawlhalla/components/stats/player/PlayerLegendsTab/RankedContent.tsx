import { t } from "@lingui/core/macro"

import { getTierFromRating } from "@/features/brawlhalla/constants/ranked/tiers"
import type { FullLegend } from "@/features/brawlhalla/helpers/parser"
import { getLegendEloReset } from "@/features/brawlhalla/helpers/season-reset"
import { calculateWinrate } from "@/features/brawlhalla/helpers/winrate"

import { RankedTierBanner } from "../../../Image"
import { CollapsibleSection } from "../../../layout/CollapsibleSection"
import type { MiscStat } from "../../MiscStatGroup"
import { MiscStatGroup } from "../../MiscStatGroup"
import { RatingDisplay } from "../../RatingDisplay"

interface PlayerLegendRankedContentProps {
  ranked: FullLegend["ranked"]
}

export const PlayerLegendRankedContent = ({
  ranked,
}: PlayerLegendRankedContentProps) => {
  if (!ranked) return null

  const eloReset = getLegendEloReset(ranked?.rating)
  const eloResetTier = getTierFromRating(eloReset)

  const rankedStats: MiscStat[] = [
    {
      name: t`Games`,
      value: ranked.games,
      desc: t`1v1 Ranked games played this season`,
    },
    {
      name: t`Winrate`,
      value: `${calculateWinrate(ranked.wins, ranked.games).toFixed(2)}%`,
      desc: t`Ranked winrate (ranked wins / ranked games)`,
    },
    ...(eloReset
      ? [
          {
            name: t`Elo reset`,
            value: <>{eloReset}</>,
            desc: t`Elo reset for next season (${eloResetTier})`,
          },
        ]
      : []),
  ]

  return (
    <CollapsibleSection trigger={t`Ranked Season`}>
      <div className="flex items-center gap-4">
        <RankedTierBanner
          tier={ranked.tier ?? "Valhallan"}
          alt={ranked.tier ?? t`Valhallan`}
          containerClassName="h-24 w-16"
          className="object-contain object-center"
        />
        <div>
          <span className="text-sm font-light">{ranked.tier}</span>
          <RatingDisplay
            className="w-80"
            games={ranked.games}
            wins={ranked.wins}
            rating={ranked.rating}
            peak_rating={ranked.peak_rating}
          />
        </div>
      </div>
      <MiscStatGroup className="mt-4" stats={rankedStats} />
    </CollapsibleSection>
  )
}
