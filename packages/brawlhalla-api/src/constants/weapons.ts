// TODO: Add translations
export const weapons = [
  "Axe",
  "Boots",
  "Bow",
  "Cannon",
  "Fists",
  "Greatsword",
  "Hammer",
  "Katar",
  "Orb",
  "Pistol",
  "RocketLance",
  "Scythe",
  "Spear",
  "Sword",
] as const

export type Weapon = (typeof weapons)[number]
