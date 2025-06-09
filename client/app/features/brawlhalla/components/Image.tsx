import type { ImgHTMLAttributes } from 'react';

import type { SafeAsset } from '@/assetsTree.gen';
import { cn } from '@/ui/lib/utils';

import type { LegendNameKey } from '../constants/legends';
import type { RankedRegion } from '../constants/ranked/regions';
import type { RankedTier } from '../constants/ranked/tiers';
import type { Weapon } from '../constants/weapons';

export type ImagePropsWithoutSrc = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  containerClassName?: string;
  Container?: 'div' | 'span';
  position?: 'absolute' | 'relative' | 'fixed' | string;
};

type UnsafeImageProps = ImagePropsWithoutSrc & {
  src: string;
};

export const UnsafeImage = ({
  containerClassName,
  Container = 'div',
  position = 'relative',
  ...props
}: UnsafeImageProps) => {
  return (
    <Container className={cn(position, containerClassName)}>
      <img {...props} />
    </Container>
  );
};

type SafeImageProps = ImagePropsWithoutSrc & {
  src: SafeAsset;
};

export const SafeImage = (props: SafeImageProps) => {
  return <UnsafeImage {...props} />;
};

type LegendIconProps = ImagePropsWithoutSrc & {
  legendNameKey: LegendNameKey;
};

export const getLegendIconSrc = (legendNameKey: LegendIconProps['legendNameKey']) =>
  `/assets/images/legends/icons/${legendNameKey}.png` as const;

export const LegendIcon = ({ legendNameKey, ...props }: LegendIconProps) => {
  return <SafeImage src={getLegendIconSrc(legendNameKey)} alt={legendNameKey} {...props} />;
};

type WeaponIconProps = ImagePropsWithoutSrc & {
  weapon: Weapon;
};

export const WeaponIcon = ({ weapon, ...props }: WeaponIconProps) => {
  return <SafeImage src={`/assets/images/weapons/icons/${weapon}.png`} alt={weapon} {...props} />;
};

type RankedTierImageProps = ImagePropsWithoutSrc & {
  tier: RankedTier;
};

export const RankedTierBanner = ({ tier, ...props }: RankedTierImageProps) => {
  return <SafeImage src={`/assets/images/ranked/banners/${tier}.png`} alt={tier} {...props} />;
};

export const RankedTierIcon = ({ tier, ...props }: RankedTierImageProps) => {
  const src =
    tier === 'Valhallan'
      ? `/assets/images/ranked/icons/Valhallan.webp`
      : (`/assets/images/ranked/icons/${tier}.png` as const);

  return <SafeImage src={src} alt={tier} {...props} />;
};

type FlagIconProps = ImagePropsWithoutSrc & {
  region: RankedRegion;
};

export const FlagIcon = ({ region, ...props }: FlagIconProps) => {
  const lowerCaseRegion = region.toLowerCase() as Lowercase<RankedRegion>;

  return (
    <SafeImage
      src={`/assets/images/flags/${lowerCaseRegion}.png`}
      alt={lowerCaseRegion}
      {...props}
    />
  );
};
