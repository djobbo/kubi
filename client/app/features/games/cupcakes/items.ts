const upgrade = (
  price: number,
  {
    intervalMultiplier,
    outputMultiplier,
  }: { intervalMultiplier?: number; outputMultiplier?: number }
) => ({
  price,
  outputMultiplier,
  intervalMultiplier,
});
const smallOutputUpgrade = (price: number) => upgrade(price, { outputMultiplier: 2 }); // +100%
const largeOutputUpgrade = (price: number) => upgrade(price, { outputMultiplier: 6 }); // +500%
const intervalUpgrade = (price: number) => upgrade(price, { intervalMultiplier: 0.5 }); // -50%

export enum ItemId {
  Helpers = 'helpers',
  Scarlet = 'scarlet',
  Orion = 'orion',
  Grimm = 'grimm',
  Kitchen = 'kitchen',
  Ivaldi = 'ivaldi',
  Farms = 'farms',
  Celestial = 'celestial',
  Grandma = 'grandma',
}

export type BaseUpgrade = ReturnType<typeof upgrade>;

export interface BaseItem {
  id: ItemId;
  name: string;
  caption: string;
  basePrice: number;
  priceMultiplier: number;
  marginPrice: number;
  output: number;
  interval: number | null;
  upgrades: BaseUpgrade[];
}

export const BASE_ITEMS = [
  {
    id: ItemId.Helpers,
    name: 'Helpful Bakers',
    caption: 'Your Greatest Fans. Bakes when you bake.',
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
    name: 'Scarlethalla Oven',
    caption: 'Discounted from Lady Scarlet herself.',
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
    caption: 'Automatic cupcake maker in each one.',
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
    name: 'Grimm',
    caption: 'Unknownst to many, Grimm has been known to bake a cupcake or two.',
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
    name: 'The Kitchen',
    caption: 'Donated and paid for by MBFC',
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
    name: 'Sons Of Ivaldi',
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
    name: 'Cupcake Farms',
    caption: 'Plant one, Harvest two. Or a few billion',
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
    name: 'Celestial Beings',
    caption: 'Might as well make use of their celestial-ness',
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
    name: 'Grandma',
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
] as const satisfies BaseItem[];
