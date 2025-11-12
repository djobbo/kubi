import {
	Region,
	isValidRegion,
	regions,
} from "@dair/api-contract/src/common/region"
import { Schema } from "effect"

/**
 * The API can return either a valid region, 'none', or an index of an arbitrary array of regions. ¯\_(ツ)_/¯
 */
export const BrawlhallaApiRegion = Schema.transform(
	Schema.NullOr(Schema.Union(Schema.NonEmptyTrimmedString, Schema.Number)),
	Region,
	{
		strict: true,
		decode: (input) => {
			if (!input) return null

			const region =
				typeof input === "number" ? regions[input - 1] : input.toLowerCase()

			if (input === "none") return null

			if (!region || !isValidRegion(region)) {
				return null
			}
			return region
		},
		encode: (input) => input,
	},
)
