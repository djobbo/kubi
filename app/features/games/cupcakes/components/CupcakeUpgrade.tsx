import { t } from "@lingui/core/macro"

import { SafeImage } from "@/features/brawlhalla/components/Image"
import { Button } from "@/ui/components/button"
import { cn } from "@/ui/lib/utils"

import type { Item, Upgrade } from "../store"
import { useCupcakesStore } from "../store"

interface CupcakeUpgradeProps {
  index: number
  upgrade: Upgrade
  item: Item
}
export const CupcakeUpgrade = ({
  index,
  upgrade,
  item,
}: CupcakeUpgradeProps) => {
  const { cupcakes, buyUpgrade } = useCupcakesStore()

  const hasNotBought = !upgrade.bought
  const hasEnoughCupcakes = upgrade.price <= cupcakes
  const hasEnoughItems = item.count >= upgrade.itemsRequired

  const canBuy = hasNotBought && hasEnoughCupcakes && hasEnoughItems

  return (
    <li key={upgrade.id}>
      <Button
        onClick={() => buyUpgrade(item.id, index)}
        disabled={!canBuy}
        className="flex flex-col items-center"
      >
        <p
          className={cn("font-bold", {
            "text-red-500": !hasEnoughCupcakes,
          })}
        >
          <span className="flex items-center">
            {upgrade.price}
            <SafeImage
              src="/assets/images/games/cupcakes/cupcake.svg"
              alt={t`Cupcake`}
              containerClassName="w-4 h-4"
              className="object-contain object-center"
            />
          </span>
        </p>
        <p
          className={cn("text-xs", {
            "text-red-500": !hasEnoughItems,
          })}
        >
          {upgrade.itemsRequired} {item.name} needed
        </p>
      </Button>
    </li>
  )
}
