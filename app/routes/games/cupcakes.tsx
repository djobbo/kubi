import { t } from "@lingui/core/macro"
import { Trans } from "@lingui/react/macro"
import { createFileRoute } from "@tanstack/react-router"
import type { MouseEventHandler } from "react"
import { useEffect } from "react"
import { v4 as uuidv4 } from "uuid"
import { create } from "zustand"

import { Image } from "@/features/brawlhalla/components/Image"
import { seo } from "@/helpers/seo"
import { Button } from "@/ui/components/button"
import { cn } from "@/ui/lib/utils"

import cupcakesStyles from "./cupcakes.css?url"

const ITEMS_REQUIREMENT_FOR_UPDATE = [10, 50, 150, 250, 500] as const
const FLOATING_CUPCAKE_SPEED_MULTIPLIER = 250

export const Route = createFileRoute("/games/cupcakes")({
  component: RouteComponent,
  head: () => {
    return {
      meta: [
        ...seo({
          title: t`Cassidy's Cupcakes • Corehalla`,
          description: t`Cassidy's Cupcakes • Corehalla`,
          image: "/assets/images/og/main-og.jpg",
        }),
      ],
      links: [{ rel: "stylesheet", href: cupcakesStyles }],
    }
  },
})

const upgrade = function (
  price: number,
  {
    intervalMultiplier,
    outputMultiplier,
  }: { intervalMultiplier?: number; outputMultiplier?: number },
) {
  return {
    price,
    outputMultiplier,
    intervalMultiplier,
  }
}
const smallOutputUpgrade = (price: number) =>
  upgrade(price, { outputMultiplier: 2 }) // +100%
const largeOutputUpgrade = (price: number) =>
  upgrade(price, { outputMultiplier: 6 }) // +500%
const intervalUpgrade = (price: number) =>
  upgrade(price, { intervalMultiplier: 0.5 }) // -50%

type BaseUpgrade = ReturnType<typeof upgrade>

enum ItemId {
  Helpers = "helpers",
  Scarlet = "scarlet",
  Orion = "orion",
  Grimm = "grimm",
  Kitchen = "kitchen",
  Ivaldi = "ivaldi",
  Farms = "farms",
  Celestial = "celestial",
  Grandma = "grandma",
}

interface BaseItem {
  id: ItemId
  name: string
  caption: string
  basePrice: number
  priceMultiplier: number
  marginPrice: number
  output: number
  interval: number | null
  upgrades: BaseUpgrade[]
}

const itemIcons = {
  [ItemId.Helpers]: "/assets/images/games/cupcakes/helpers.svg",
  [ItemId.Scarlet]: "/assets/images/games/cupcakes/scarlet.svg",
  [ItemId.Orion]: "/assets/images/games/cupcakes/orion.svg",
  [ItemId.Grimm]: "/assets/images/games/cupcakes/grimm.svg",
  [ItemId.Kitchen]: "/assets/images/games/cupcakes/kitchen.svg",
  [ItemId.Ivaldi]: "/assets/images/games/cupcakes/ivaldi.svg",
  [ItemId.Farms]: "/assets/images/games/cupcakes/farms.svg",
  [ItemId.Celestial]: "/assets/images/games/cupcakes/celestial.svg",
  [ItemId.Grandma]: "/assets/images/games/cupcakes/grandma.svg",
}

const BASE_ITEMS = [
  {
    id: ItemId.Helpers,
    name: "Helpful Bakers",
    caption: "Your Greatest Fans. Bakes when you bake.",
    basePrice: 10,
    priceMultiplier: 2.6,
    marginPrice: 1,
    output: 1,
    interval: null,
    upgrades: [
      smallOutputUpgrade(100),
      smallOutputUpgrade(1_500),
      smallOutputUpgrade(8_500),
      smallOutputUpgrade(35_000),
      smallOutputUpgrade(150_000),
    ],
  },
  {
    id: ItemId.Scarlet,
    name: "Scarlethalla Oven",
    caption: "Discounted from Lady Scarlet herself.",
    basePrice: 15,
    priceMultiplier: 1.9,
    marginPrice: 5,
    output: 5,
    interval: 5,
    upgrades: [
      smallOutputUpgrade(300),
      intervalUpgrade(1_500),
      smallOutputUpgrade(4_500),
      intervalUpgrade(75_000),
      largeOutputUpgrade(100_000),
    ],
  },
  {
    id: ItemId.Orion,
    name: "Orion's Lance",
    caption: "Automatic cupcake maker in each one.",
    output: 100,
    interval: 10,
    basePrice: 150,
    priceMultiplier: 1.8,
    marginPrice: 145,
    upgrades: [
      smallOutputUpgrade(900),
      intervalUpgrade(45_000),
      smallOutputUpgrade(105_000),
      intervalUpgrade(360_000),
      largeOutputUpgrade(2_000_000),
    ],
  },
  {
    id: ItemId.Grimm,
    name: "Grimm",
    caption:
      "Unknownst to many, Grimm has been known to bake a cupcake or two.",
    output: 7_000,
    interval: 20,
    basePrice: 5_000,
    priceMultiplier: 1.7,
    marginPrice: 8_000,
    upgrades: [
      smallOutputUpgrade(50_000),
      intervalUpgrade(150_000),
      smallOutputUpgrade(450_000),
      intervalUpgrade(1_200_000),
      largeOutputUpgrade(4_000_000),
    ],
  },
  {
    id: ItemId.Kitchen,
    name: "The Kitchen",
    caption: "Donated and paid for by MBFC",
    output: 45_000,
    interval: 30,
    basePrice: 75_000,
    priceMultiplier: 1.6,
    marginPrice: 35_000,
    upgrades: [
      smallOutputUpgrade(200_000),
      intervalUpgrade(1_000_000),
      smallOutputUpgrade(5_000_000),
      intervalUpgrade(10_000_000),
      largeOutputUpgrade(50_000_000),
    ],
  },
  {
    id: ItemId.Ivaldi,
    name: "Sons Of Ivaldi",
    caption: "Surely there couldn't have been THIS many sons.",
    output: 100_000,
    interval: 40,
    basePrice: 890_000,
    priceMultiplier: 1.5,
    marginPrice: 150_000,
    upgrades: [
      smallOutputUpgrade(50_000_000),
      intervalUpgrade(450_000_000),
      smallOutputUpgrade(3_000_000_000),
      intervalUpgrade(15_000_000_000),
      largeOutputUpgrade(65_000_000_000),
    ],
  },
  {
    id: ItemId.Farms,
    name: "Cupcake Farms",
    caption: "Plant one, Harvest two. Or a few billion",
    output: 320_000,
    interval: 50,
    basePrice: 5_000_000,
    priceMultiplier: 1.4,
    marginPrice: 400_000,
    upgrades: [
      smallOutputUpgrade(450_000_000),
      intervalUpgrade(3_000_000_000),
      smallOutputUpgrade(15_000_000_000),
      intervalUpgrade(65_000_000_000),
      largeOutputUpgrade(150_000_000_000),
    ],
  },
  {
    id: ItemId.Celestial,
    name: "Celestial Beings",
    caption: "Might as well make use of their celestial-ness",
    output: 4_500_000,
    interval: 60,
    basePrice: 15_000_000,
    priceMultiplier: 1.3,
    marginPrice: 6_000_000,
    upgrades: [
      smallOutputUpgrade(5_000_000_000),
      intervalUpgrade(55_500_000_000),
      smallOutputUpgrade(660_000_000_000),
      intervalUpgrade(7_500_000_000_000),
      largeOutputUpgrade(6_600_000_000_000),
    ],
  },
  {
    id: ItemId.Grandma,
    name: "Grandma",
    caption: '"Stop eating the batter, young miss!" -Grandma',
    output: 15_000_000,
    interval: 70,
    basePrice: 600_000_000,
    priceMultiplier: 1.2,
    marginPrice: 20_000_000,
    upgrades: [
      smallOutputUpgrade(10_000_000_000),
      intervalUpgrade(550_000_000_000),
      smallOutputUpgrade(6_050_000_000_000),
      intervalUpgrade(66_550_000_000_000),
      largeOutputUpgrade(732_050_000_000_000),
    ],
  },
] as const satisfies BaseItem[]

type Upgrade = BaseUpgrade & {
  id: string
  bought: boolean
  itemsRequired: number
}

type Item = Omit<BaseItem, "id" | "upgrades"> & {
  id: ItemId
  count: number
  upgrades: Upgrade[]
}

interface FloatingCupcake {
  id: string
  value: number
  position: {
    x: number
    y: number
  }
  direction: {
    x: number
    y: number
  }
}

interface CupcakesState {
  cupcakes: number
  items: Item[]
  floatingCupcakes: FloatingCupcake[]
}

interface CupcakesActions {
  onClick: (x?: number, y?: number) => void
  onInterval: (deltaTime: number) => void
  buyItem: (id: ItemId, amount: number) => void
  buyUpgrade: (itemId: ItemId, upgradeIndex: number) => void
  addFloatingCupcake: (value: number, x?: number, y?: number) => () => void
}

type CupcakesStore = CupcakesState & CupcakesActions

const calculateItemPrice = (item: BaseItem, count: number) => {
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

const calculateMultipleItemsPrice = (item: Item, amount: number) => {
  let price = 0
  for (let i = 0; i < amount; i++) {
    price += calculateItemPrice(BASE_ITEMS[0], item.count + i)
  }

  if (amount < 0) {
    // We sell items at half price
    return price * -0.5
  }

  return price
}

const useCupcakesStore = create<CupcakesStore>()((set) => ({
  cupcakes: 0,
  items: BASE_ITEMS.map((item) => ({
    ...item,
    count: 0,
    price: item.basePrice,
    upgrades: item.upgrades.map((upgrade, i) => ({
      ...upgrade,
      id: `${item.id}_${i}`,
      bought: false,
      itemsRequired: ITEMS_REQUIREMENT_FOR_UPDATE[i],
    })),
  })),
  floatingCupcakes: [],
  onClick: (x = 0, y = 0) =>
    set((state) => {
      const clickOutput = state.items.reduce(
        (acc, item) => acc + item.count * item.output,
        1,
      )

      const removeCupcake = state.addFloatingCupcake(clickOutput, x, y)

      setTimeout(() => {
        removeCupcake()
      }, 2000)

      return { cupcakes: state.cupcakes + clickOutput }
    }),
  onInterval: (deltaTime) =>
    set((state) => {
      const deltaMultiplier = deltaTime / 1000
      const intervalOutput = state.items.reduce((acc, item) => {
        if (!item.interval) return acc

        // TODO calc output factor based on upgrades

        return acc + (item.count * item.output) / item.interval
      }, 0)

      return { cupcakes: state.cupcakes + intervalOutput * deltaMultiplier }
    }),
  buyItem: (id, amount) => {
    set((state) => {
      const item = state.items.find((i) => i.id === id)
      if (!item) return state

      const price = calculateMultipleItemsPrice(item, amount)
      if (state.cupcakes < price) return state

      return {
        cupcakes: state.cupcakes - price,
        items: state.items.map((i) =>
          i.id === id ? { ...i, count: i.count + amount } : i,
        ),
      }
    })
  },
  buyUpgrade: (itemId, upgradeIndex) => {
    set((state) => {
      const item = state.items.find((i) => i.id === itemId)
      if (!item) return state

      const upgrade = item.upgrades[upgradeIndex]
      if (!upgrade || upgrade.bought) return state

      if (state.cupcakes < upgrade.price) return state

      console.log("buying upgrade", {
        id: item.id,
        o: item.output,
        i: item.interval,
        uo: upgrade.outputMultiplier,
        ui: upgrade.intervalMultiplier,
        fo: item.output * (upgrade.outputMultiplier ?? 1),
        fi: item.interval
          ? item.interval * (upgrade.intervalMultiplier ?? 1)
          : null,
      })

      return {
        cupcakes: state.cupcakes - upgrade.price,
        items: state.items.map((i) =>
          i.id === itemId
            ? {
                ...i,
                upgrades: i.upgrades.map((u, i) =>
                  i === upgradeIndex ? { ...u, bought: true } : u,
                ),
                output: i.output * (upgrade.outputMultiplier ?? 1),
                interval: i.interval
                  ? i.interval * (upgrade.intervalMultiplier ?? 1)
                  : i.interval,
              }
            : i,
        ),
      }
    })
  },
  addFloatingCupcake: (value, x = 0, y = 0) => {
    const id = uuidv4()
    set((state) => {
      const angle = Math.random() * Math.PI * 2
      const direction = {
        x: Math.sin(angle),
        y: Math.cos(angle),
      }

      return {
        floatingCupcakes: [
          ...state.floatingCupcakes,
          { id, value, position: { x, y }, direction },
        ],
      }
    })

    return () => {
      set((state) => ({
        floatingCupcakes: state.floatingCupcakes.filter((f) => f.id !== id),
      }))
    }
  },
}))

function RouteComponent() {
  const {
    cupcakes,
    onClick,
    items,
    buyItem,
    buyUpgrade,
    onInterval,
    floatingCupcakes,
  } = useCupcakesStore()

  useEffect(() => {
    const interval = setInterval(() => {
      onInterval(100)
    }, 100)

    return () => clearInterval(interval)
  }, [])

  const formattedCupcakes = cupcakes.toFixed(0)

  const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    const rect = event.currentTarget.getBoundingClientRect()
    onClick(event.clientX - rect.left, event.clientY - rect.top)
  }

  return (
    <>
      <h1>
        <Trans>Cassidy's Cupcakes</Trans>
      </h1>
      <p>
        <Trans>You have {formattedCupcakes} cupcakes</Trans>
      </p>
      <div className="relative inline-block">
        <button
          type="button"
          onClick={handleClick}
          className="scale-95 hover:scale-100 active:scale-95 transition-transform"
        >
          <Image
            src="/assets/images/games/cupcakes/cupcake.svg"
            alt={t`Cupcake`}
            containerClassName="w-80 h-80"
            className="object-contain object-center w-full h-full"
          />
        </button>
        {floatingCupcakes.map((cupcake) => (
          <div
            key={cupcake.id}
            className="absolute pointer-events-none text-amber-600 font-bold animate-cupcake-float flex flex-col items-center justify-center"
            style={{
              left: `${cupcake.position.x}px`,
              top: `${cupcake.position.y}px`,
              "--direction-x": `${cupcake.direction.x * FLOATING_CUPCAKE_SPEED_MULTIPLIER}px`,
              "--direction-y": `${cupcake.direction.y * FLOATING_CUPCAKE_SPEED_MULTIPLIER}px`,
            }}
          >
            +{cupcake.value}
            <Image
              src="/assets/images/games/cupcakes/cupcake.svg"
              alt={t`Cupcake`}
              containerClassName="w-6 h-6"
              className="object-contain object-center"
            />
          </div>
        ))}
      </div>
      {items.map((item, i) => {
        const previousItem = items[i - 1]
        if (!!previousItem && previousItem.count < 1) {
          return null
        }

        const price = calculateItemPrice(item, item.count)
        const showProgress = !!item.interval && item.count > 0

        return (
          <div key={item.id} className="m-8">
            <h2 className="flex gap-2">
              <Image
                src={itemIcons[item.id]}
                alt={item.name}
                containerClassName="w-8 h-8 bg-bg p-1 rounded-full"
                className="object-contain object-center"
              />
              {item.name} ({item.count})
            </h2>
            <p>{item.caption}</p>
            {/* progress bar, show each interval tick */}
            {showProgress && (
              <div
                className="cupcake-progress w-64 h-8 relative bg-amber-200 rounded-lg overflow-hidden after:rounded-lg"
                style={{
                  "--interval": `${item.interval}s`,
                }}
              />
            )}
            <div className="flex">
              <Button
                onClick={() => buyItem(item.id, 1)}
                disabled={price > cupcakes}
              >
                <Trans>Buy ({price})</Trans>
              </Button>
            </div>
            <ul className="flex gap-4">
              {item.upgrades.map((upgrade, index) => {
                const previousUpgrade = item.upgrades[index - 1]
                if (!!previousUpgrade && !previousUpgrade.bought) {
                  return null
                }

                const hasNotBought = !upgrade.bought
                const hasEnoughCupcakes = upgrade.price <= cupcakes
                const hasEnoughItems = item.count >= upgrade.itemsRequired

                const canBuy =
                  hasNotBought && hasEnoughCupcakes && hasEnoughItems

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
                          <Image
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
              })}
            </ul>
          </div>
        )
      })}
    </>
  )
}
