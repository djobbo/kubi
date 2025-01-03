import type { ImgHTMLAttributes } from "react"

import { cn } from "@/ui/lib/utils"

import type { LegendNameKey } from "../constants/legends"
import type { RankedRegion } from "../constants/ranked/regions"
import type { RankedTier } from "../constants/ranked/tiers"
import type { Weapon } from "../constants/weapons"

type ImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  containerClassName?: string
  Container?: "div" | "span"
  position?: "absolute" | "relative" | "fixed" | string
}

export const Image = ({
  containerClassName,
  Container = "div",
  position = "relative",
  ...props
}: ImageProps) => {
  return (
    <Container className={cn(position, containerClassName)}>
      <img {...props} />
    </Container>
  )
}

type ImagePropsWithoutSrc = Omit<ImageProps, "src">

type LegendIconProps = ImagePropsWithoutSrc & {
  legendNameKey: LegendNameKey | (string & {})
}

export const getLegendIconSrc = (
  legendNameKey: LegendIconProps["legendNameKey"],
) => `/assets/images/legends/icons/${legendNameKey}.png`

export const LegendIcon = ({ legendNameKey, ...props }: LegendIconProps) => {
  return (
    <Image
      src={getLegendIconSrc(legendNameKey)}
      alt={legendNameKey}
      {...props}
    />
  )
}

type WeaponIconProps = ImagePropsWithoutSrc & {
  weapon: Weapon | (string & {})
}

export const WeaponIcon = ({ weapon, ...props }: WeaponIconProps) => {
  return (
    <Image
      src={`/assets/images/weapons/icons/${weapon}.png`}
      alt={weapon}
      {...props}
    />
  )
}

type RankedTierImageProps = ImagePropsWithoutSrc & {
  tier: RankedTier
  type: "icon" | "banner"
}

export const RankedTierImage = ({
  tier,
  type,
  ...props
}: RankedTierImageProps) => {
  return (
    <Image
      src={`/assets/images/ranked/${type}s/${tier}${
        tier === "Valhallan" ? ".webp" : ".png"
      }`}
      alt={tier}
      {...props}
    />
  )
}

type FlagIconProps = ImagePropsWithoutSrc & {
  region: RankedRegion
}

export const FlagIcon = ({ region, ...props }: FlagIconProps) => {
  return (
    <Image
      src={`/assets/images/flags/${region}.png`}
      alt={region.toLowerCase()}
      {...props}
    />
  )
}
