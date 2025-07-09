import { Schema } from "effect"

export const BrawlhallaApiLegend = Schema.Struct({
	legend_id: Schema.Number,
	legend_name_key: Schema.String,
	bio_name: Schema.String,
	bio_aka: Schema.String,
	weapon_one: Schema.String,
	weapon_two: Schema.String,
	strength: Schema.NumberFromString,
	dexterity: Schema.NumberFromString,
	defense: Schema.NumberFromString,
	speed: Schema.NumberFromString,
})

export const BrawlhallaApiLegends = Schema.Array(BrawlhallaApiLegend)
