import type { ImagePropsWithoutSrc } from "@/features/brawlhalla/components/Image"
import { SafeImage } from "@/features/brawlhalla/components/Image"

import type { ItemId } from "../items"

type ItemIconProps = ImagePropsWithoutSrc & {
	itemId: ItemId
}

export const ItemIcon = ({ itemId, ...props }: ItemIconProps) => {
	return (
		<SafeImage
			src={`/assets/images/games/cupcakes/${itemId}.svg`}
			alt={itemId}
			{...props}
		/>
	)
}
