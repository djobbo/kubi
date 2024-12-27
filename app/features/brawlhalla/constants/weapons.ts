import { legends } from "./legends"

export type Weapon =
  | (typeof legends)[number]["weapon_one"]
  | (typeof legends)[number]["weapon_two"]

export const weapons = legends.reduce<Weapon[]>((acc, legend) => {
  if (!acc.includes(legend.weapon_one)) {
    acc.push(legend.weapon_one)
  }
  if (!acc.includes(legend.weapon_two)) {
    acc.push(legend.weapon_two)
  }
  return acc
}, [])
