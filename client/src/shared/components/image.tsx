import type { CSSProperties, ImgHTMLAttributes } from "react"

import type { SafeAsset } from "@/assetsTree.gen"
import { cn } from "@dair/common/src/helpers/ui"

import type { LegendNameKey } from "@dair/brawlhalla-api/src/constants/legends"
import type { RankedRegion } from "@dair/brawlhalla-api/src/constants/ranked/regions"
import type { TierName } from "@dair/api-contract/src/shared/tier"

export type ImagePropsWithoutSrc = Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  "src"
> & {
  containerClassName?: string
  Container?: "div" | "span"
  position?: "absolute" | "relative" | "fixed" | string
  containerStyle?: CSSProperties
}

type UnsafeImageProps = ImagePropsWithoutSrc & {
  src: string
}

export const UnsafeImage = ({
  containerClassName,
  Container = "div",
  position = "relative",
  containerStyle,
  ...props
}: UnsafeImageProps) => {
  return (
    <Container
      className={cn(position, containerClassName)}
      style={containerStyle}
    >
      <img {...props} />
    </Container>
  )
}

type SafeImageProps = ImagePropsWithoutSrc & {
  src: SafeAsset
}

export const SafeImage = (props: SafeImageProps) => {
  return <UnsafeImage {...props} />
}

type LegendIconProps = ImagePropsWithoutSrc & {
  legendNameKey: LegendNameKey
}

export const getLegendIconSrc = (
  legendNameKey: LegendIconProps["legendNameKey"],
) => `/assets/images/legends/icons/${legendNameKey}.png` as const

export const LegendIcon = ({ legendNameKey, ...props }: LegendIconProps) => {
  return (
    <SafeImage
      src={getLegendIconSrc(legendNameKey)}
      alt={legendNameKey}
      {...props}
    />
  )
}

type WeaponIconProps = ImagePropsWithoutSrc & {
  weapon: string
}

export const WeaponIcon = ({ weapon, ...props }: WeaponIconProps) => {
  return (
    <SafeImage
      src={`/assets/images/weapons/icons/${weapon}.png`}
      alt={weapon}
      {...props}
    />
  )
}

type RankedTierImageProps = ImagePropsWithoutSrc & {
  tier: TierName | null
}

export const RankedTierBanner = ({ tier, ...props }: RankedTierImageProps) => {
  const nonNullTier = tier ?? "Valhallan"

  return (
    <SafeImage
      src={`/assets/images/ranked/banners/${nonNullTier}.png`}
      alt={nonNullTier}
      {...props}
    />
  )
}

export const RankedTierIcon = ({ tier, ...props }: RankedTierImageProps) => {
  const nonNullTier: TierName = tier ?? "Valhallan"
  const src =
    nonNullTier === "Valhallan"
      ? "/assets/images/ranked/icons/Valhallan.webp"
      : (`/assets/images/ranked/icons/${nonNullTier}.png` as const)

  return <SafeImage src={src} alt={nonNullTier} {...props} />
}

type FlagIconProps = ImagePropsWithoutSrc & {
  region: RankedRegion
}

export const FlagIcon = ({ region, ...props }: FlagIconProps) => {
  const lowerCaseRegion = region.toLowerCase() as Lowercase<RankedRegion>

  return (
    <SafeImage
      src={`/assets/images/flags/${lowerCaseRegion}.png`}
      alt={lowerCaseRegion}
      {...props}
    />
  )
}
