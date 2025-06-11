import { v4 as uuidv4 } from "uuid"
import { create } from "zustand"

import { ITEMS_REQUIREMENT_FOR_UPDATE } from "./contants"
import { calculateMultipleItemsPrice } from "./helpers/calculate-price"
import {
	BASE_ITEMS,
	type BaseItem,
	type BaseUpgrade,
	type ItemId,
} from "./items"

export type Upgrade = BaseUpgrade & {
	id: string
	bought: boolean
	itemsRequired: number
}

export type Item = Omit<BaseItem, "id" | "upgrades"> & {
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

export const useCupcakesStore = create<CupcakesStore>()((set) => ({
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
