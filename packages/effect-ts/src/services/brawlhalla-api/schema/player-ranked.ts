import { ParseResult, Schema } from "effect"
import { CleanString } from "../../../helpers/clean-string"
import { NumberFromString } from "../../../helpers/number-from-string"

const tiers = [
	"Valhallan",
	"Diamond",
	"Platinum 5",
	"Platinum 4",
	"Platinum 3",
	"Platinum 2",
	"Platinum 1",
	"Gold 5",
	"Gold 4",
	"Gold 3",
	"Gold 2",
	"Gold 1",
	"Silver 5",
	"Silver 4",
	"Silver 3",
	"Silver 2",
	"Silver 1",
	"Bronze 5",
	"Bronze 4",
	"Bronze 3",
	"Bronze 2",
	"Bronze 1",
	"Tin 5",
	"Tin 4",
	"Tin 3",
	"Tin 2",
	"Tin 1",
	"Tin 0",
] as const

// Api returns `null` for Valhallan tier
const Tier = Schema.transformOrFail(
	Schema.NullOr(Schema.NonEmptyTrimmedString),
	Schema.Literal(...tiers),
	{
		strict: true,
		decode: (input, _, ast) => {
			if (input === null) {
				return ParseResult.succeed("Valhallan")
			}
			if (!tiers.includes(input)) {
				return ParseResult.fail(
					new ParseResult.Type(ast, input, "Invalid ranked tier"),
				)
			}
			return ParseResult.succeed(input as (typeof tiers)[number])
		},
		encode: (input) => ParseResult.succeed(input),
	},
)

const regions = [
	"us-e",
	"eu",
	"sea",
	"brz",
	"aus",
	"us-w",
	"jpn",
	"sa",
	"me",
] as const

const Region = Schema.transformOrFail(
	Schema.Union(Schema.NonEmptyTrimmedString, Schema.Number),
	Schema.Literal(...regions),
	{
		strict: true,
		decode: (input, _, ast) => {
			// Region is sometimes a number, sometimes a string
			const region =
				typeof input === "number"
					? regions[input - 1]
					: (input.toLowerCase() as (typeof regions)[number])
			if (!region || !regions.includes(region)) {
				return ParseResult.fail(
					new ParseResult.Type(ast, input, "Invalid ranked region"),
				)
			}
			return ParseResult.succeed(region)
		},
		encode: (input) => ParseResult.succeed(input),
	},
)

const Legend = Schema.Struct({
	legend_id: Schema.Number,
	legend_name_key: Schema.String,
	rating: Schema.Number,
	peak_rating: Schema.Number,
	tier: Tier,
	wins: Schema.Number,
	games: Schema.Number,
})

const Ranked2v2Team = Schema.Struct({
	brawlhalla_id_one: NumberFromString,
	brawlhalla_id_two: NumberFromString,
	rating: Schema.Number,
	peak_rating: Schema.Number,
	tier: Tier,
	wins: Schema.Number,
	games: Schema.Number,
	teamname: CleanString,
	region: Schema.Number,
	global_rank: Schema.Number,
})

const RotatingRanked = Schema.Struct({
	name: CleanString,
	brawlhalla_id: NumberFromString,
	rating: Schema.Number,
	peak_rating: Schema.Number,
	tier: Tier,
	wins: Schema.Number,
	games: Schema.Number,
	region: Region,
})

const ApiRotatingRanked = Schema.transformOrFail(
	Schema.Union(Schema.Array(Schema.Unknown), RotatingRanked),
	Schema.NullOr(RotatingRanked),
	{
		strict: true,
		decode: (input) => {
			if (Array.isArray(input)) {
				return ParseResult.succeed(null)
			}
			return ParseResult.succeed(input)
		},
		encode: (input) => ParseResult.succeed(input),
	},
)

export const BrawlhallaApiPlayerRanked = Schema.Struct({
	name: CleanString,
	brawlhalla_id: NumberFromString,
	global_rank: Schema.Number,
	region_rank: Schema.Number,
	legends: Schema.Array(Legend),
	"2v2": Schema.Array(Ranked2v2Team),
	rating: Schema.Number,
	peak_rating: Schema.Number,
	tier: Tier,
	wins: Schema.Number,
	games: Schema.Number,
	region: Region,
	rotating_ranked: ApiRotatingRanked,
})

export type BrawlhallaApiPlayerRanked = Schema.Schema.Type<
	typeof BrawlhallaApiPlayerRanked
>
