import { t } from "@lingui/core/macro"
import { Trans } from "@lingui/react/macro"
import { memo } from "react"

import { LegendIcon } from "@/features/brawlhalla/components/Image"
import type {
  FullLegend,
  FullWeapon,
} from "@/features/brawlhalla/helpers/parser"
import { calculateWinrate } from "@/features/brawlhalla/helpers/winrate"

import { SectionTitle } from "../../../layout/SectionTitle"
import type { MiscStat } from "../../MiscStatGroup"
import { MiscStatGroup } from "../../MiscStatGroup"

interface PlayerWeaponRankedContentProps {
  weapon: FullWeapon
}

export const PlayerWeaponRankedContent = memo(
  function PlayerWeaponRankedContent({
    weapon,
  }: PlayerWeaponRankedContentProps) {
    const ranked = weapon.legends.reduce<{
      games: number
      wins: number
      totalRating: number
      totalPeakRating: number
      mostPlayedLegend?: FullLegend
      highestRatedLegend?: FullLegend
      highestPeakRatedLegend?: FullLegend
      hasPlayedRanked: boolean
    }>(
      (acc, legend) => {
        if (!legend.ranked) return acc

        return {
          games: acc.games + legend.ranked.games,
          wins: acc.wins + legend.ranked.wins,
          totalRating: acc.totalRating + legend.ranked.rating,
          totalPeakRating: acc.totalPeakRating + legend.ranked.peak_rating,
          mostPlayedLegend:
            (acc.mostPlayedLegend?.ranked?.games ?? 0) < legend.ranked.games
              ? legend
              : acc.mostPlayedLegend,
          highestRatedLegend:
            (acc.highestRatedLegend?.ranked?.rating ?? 0) < legend.ranked.rating
              ? legend
              : acc.highestRatedLegend,
          highestPeakRatedLegend:
            (acc.highestPeakRatedLegend?.ranked?.peak_rating ?? 0) <
            legend.ranked.peak_rating
              ? legend
              : acc.highestPeakRatedLegend,
          hasPlayedRanked: true,
        }
      },
      {
        games: 0,
        wins: 0,
        totalRating: 0,
        totalPeakRating: 0,
        hasPlayedRanked: false,
      },
    )

    if (!ranked.hasPlayedRanked) return null

    const rating = Math.floor(ranked.totalRating / weapon.legends.length)
    const peakRating = Math.floor(
      ranked.totalPeakRating / weapon.legends.length,
    )

    const rankedStats: MiscStat[] = [
      {
        name: t`Games`,
        value: ranked.games,
        desc: t`1v1 Ranked games played this season`,
      },
      {
        name: t`Wins`,
        value: ranked.wins,
        desc: t`1v1 Ranked wins this season`,
      },
      {
        name: t`Losses`,
        value: ranked.games - ranked.wins,
        desc: t`1v1 Ranked losses this season`,
      },
      {
        name: t`Winrate`,
        value: `${calculateWinrate(ranked.wins, ranked.games).toFixed(2)}%`,
        desc: t`Ranked winrate (ranked wins / ranked games)`,
      },
      {
        name: t`Most played`,
        value: ranked.mostPlayedLegend ? (
          <div className="flex items-center gap-2">
            <LegendIcon
              legendNameKey={ranked.mostPlayedLegend.legend_name_key}
              alt={ranked.mostPlayedLegend.bio_name}
              containerClassName="w-8 h-8 overflow-hidden rounded-sm"
              className="object-contain object-center"
            />
            <Trans>{ranked.mostPlayedLegend.ranked?.games} games</Trans>
          </div>
        ) : (
          <Trans>None</Trans>
        ),
        desc: t`Legend that has played the most games with this weapon`,
      },
      {
        name: t`Highest elo`,
        value: ranked.highestRatedLegend ? (
          <div className="flex items-center gap-2">
            <div>
              <LegendIcon
                legendNameKey={ranked.highestRatedLegend.legend_name_key}
                alt={ranked.highestRatedLegend.bio_name}
                containerClassName="w-8 h-8 overflow-hidden rounded-sm"
                className="object-contain object-center"
              />
            </div>
            {ranked.highestRatedLegend.ranked?.rating} elo
          </div>
        ) : (
          <Trans>None</Trans>
        ),
        desc: t`Legend that has the highest elo with this weapon`,
      },
      {
        name: t`Highest peak elo`,
        value: ranked.highestPeakRatedLegend ? (
          <div className="flex items-center gap-2">
            <LegendIcon
              legendNameKey={ranked.highestPeakRatedLegend.legend_name_key}
              alt={ranked.highestPeakRatedLegend.bio_name}
              containerClassName="w-8 h-8 overflow-hidden rounded-sm"
              className="object-contain object-center"
            />
            {ranked.highestPeakRatedLegend.ranked?.rating} elo
          </div>
        ) : (
          <Trans>None</Trans>
        ),
        desc: t`Legend that has the highest peak elo with this weapon`,
      },
      {
        name: t`Average elo`,
        value: rating,
        desc: t`Average elo of the legends that use this weapon`,
      },
      {
        name: t`Average peak elo`,
        value: peakRating,
        desc: t`Average peak elo of the legends that use this weapon`,
      },
    ]

    return (
      <>
        <SectionTitle hasBorder customMargin className="my-4">
          <Trans>Ranked Season</Trans>
        </SectionTitle>
        <MiscStatGroup className="mt-4" stats={rankedStats} />
      </>
    )
  },
)
