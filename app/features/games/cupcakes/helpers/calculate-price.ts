import { type BaseItem, ItemId } from "../items"
import type { Item } from "../store"

export const calculateItemPrice = (item: BaseItem, count: number) => {
  let priceMultiplier: number = item.priceMultiplier
  let marginPrice: number = item.marginPrice

  switch (true) {
    case count < 10:
      priceMultiplier *= 1
      break
    case count < 50:
      priceMultiplier *= 1.2
      break
    case count < 100:
      priceMultiplier *= 1.4
      break
    case count < 500:
      priceMultiplier *= 1.6
      break
    case count < 1000:
      priceMultiplier *= 3.3
      break
    case count < 6000:
      priceMultiplier *= 6.5
      break
    default:
      priceMultiplier *= 10
  }

  if (count > 400) {
    switch (item.id) {
      case ItemId.Helpers:
        marginPrice = 50
        break
      case ItemId.Scarlet:
        marginPrice = 75
        break
    }
  }

  const extra = priceMultiplier * marginPrice * count
  return Math.round(item.basePrice + extra)
}

export const calculateMultipleItemsPrice = (item: Item, amount: number) => {
  let price = 0
  for (let i = 0; i < amount; i++) {
    price += calculateItemPrice(item, item.count + i)
  }

  if (amount < 0) {
    // We sell items at half price
    return price * -0.5
  }

  return price
}
