import { Schema } from "effect"
import { CleanString } from "../../../helpers/clean-string"
import { NumberFromString } from "../../../helpers/number-from-string"

const Legend = Schema.Struct({
	legend_id: Schema.Number,
	legend_name_key: Schema.NonEmptyTrimmedString,
	damagedealt: NumberFromString,
	damagetaken: NumberFromString,
	kos: Schema.Number,
	falls: Schema.Number,
	suicides: Schema.Number,
	teamkos: Schema.Number,
	matchtime: Schema.Number,
	games: Schema.Number,
	wins: Schema.Number,
	damageunarmed: NumberFromString,
	damagethrownitem: NumberFromString,
	damageweaponone: NumberFromString,
	damageweapontwo: NumberFromString,
	damagegadgets: NumberFromString,
	kounarmed: NumberFromString,
	kothrownitem: NumberFromString,
	koweaponone: NumberFromString,
	koweapontwo: NumberFromString,
	kogadgets: NumberFromString,
	timeheldweaponone: NumberFromString,
	timeheldweapontwo: NumberFromString,
	xp: Schema.Number,
	level: Schema.Number,
	xp_percentage: Schema.Number,
})

const Clan = Schema.Struct({
	clan_name: CleanString,
	clan_id: NumberFromString,
	clan_xp: Schema.String,
	personal_xp: Schema.Number,
})

export const BrawlhallaApiPlayerStats = Schema.Struct({
	brawlhalla_id: NumberFromString,
	name: CleanString,
	xp: Schema.Number,
	level: Schema.Number,
	xp_percentage: Schema.Number,
	games: Schema.Number,
	wins: Schema.Number,
	damagebomb: NumberFromString,
	damagemine: NumberFromString,
	damagespikeball: NumberFromString,
	damagesidekick: NumberFromString,
	hitsnowball: NumberFromString,
	kobomb: NumberFromString,
	komine: NumberFromString,
	kospikeball: NumberFromString,
	kosidekick: NumberFromString,
	kosnowball: NumberFromString,
	legends: Schema.Array(Legend),
	clan: Schema.optionalWith(Clan, {}),
})

export type BrawlhallaApiPlayerStats = Schema.Schema.Type<
	typeof BrawlhallaApiPlayerStats
>
