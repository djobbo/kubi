import { Trans } from "@lingui/react/macro"
import type { CSSProperties } from "react"

import { Button } from "@/ui/components/button"

import { calculateItemPrice } from "../helpers/calculate-price"
import type { Item } from "../store"
import { useCupcakesStore } from "../store"
import { CupcakeUpgrade } from "./CupcakeUpgrade"
import { ItemIcon } from "./ItemImage"

interface CupcakeItemProps {
  item: Item
}

const CupcakeProgress = ({ item }: CupcakeItemProps) => {
  const showProgress = !!item.interval && item.count > 0

  if (!showProgress) {
    return null
  }

  return (
    <div
      className="cupcake-progress w-64 h-8 relative bg-amber-200 rounded-lg overflow-hidden after:rounded-lg"
      style={
        {
          "--interval": `${item.interval}s`,
        } as CSSProperties
      }
    />
  )
}

const CupcakeItem = ({ item }: CupcakeItemProps) => {
  const { cupcakes, buyItem } = useCupcakesStore()

  const price = calculateItemPrice(item, item.count)

  return (
    <div key={item.id} className="m-8">
      <h2 className="flex gap-2">
        <ItemIcon
          itemId={item.id}
          containerClassName="w-8 h-8 bg-bg p-1 rounded-full"
          className="object-contain object-center"
        />
        {item.name} ({item.count})
      </h2>
      <p>{item.caption}</p>
      <CupcakeProgress item={item} />
      <div className="flex">
        <Button onClick={() => buyItem(item.id, 1)} disabled={price > cupcakes}>
          <Trans>Buy ({price})</Trans>
        </Button>
      </div>
      <ul className="flex gap-4">
        {item.upgrades.map((upgrade, index) => {
          const previousUpgrade = item.upgrades[index - 1]
          if (!!previousUpgrade && !previousUpgrade.bought) {
            return null
          }

          return (
            <CupcakeUpgrade
              key={upgrade.id}
              index={index}
              upgrade={upgrade}
              item={item}
            />
          )
        })}
      </ul>
    </div>
  )
}

export const CupcakeItems = () => {
  const { items } = useCupcakesStore()

  return items.map((item, i) => {
    const previousItem = items[i - 1]
    if (!!previousItem && previousItem.count < 1) {
      return null
    }

    return <CupcakeItem key={item.id} item={item} />
  })
}
