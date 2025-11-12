import { Schema } from "effect"

export const regions = [
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

const allRegion = "all"

export const isValidRegion = (
	input: string,
): input is (typeof regions)[number] => {
	return regions.includes(input as (typeof regions)[number])
}

export const Region = Schema.NullOr(Schema.Literal(...regions))

export const AnyRegion = Schema.Literal(...regions, allRegion)
