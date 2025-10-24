import { Schema } from 'effect'

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

const isValidTier = (input: string): input is (typeof tiers)[number] => {
    return tiers.includes(input as (typeof tiers)[number])
}

export const Tier = Schema.NullOr(Schema.Literal(...tiers))

/**
 * The API returns `null` for Valhallan tier, so we need to handle that case.
 */
export const BrawlhallaApiTier = Schema.transform(
	Schema.NullOr(Schema.NonEmptyTrimmedString),
	Tier,
	{
		strict: true,
		decode: (input) => {
			if (input === null) {
				return "Valhallan" as const
			}

			if (input === "none") {
				return null
			}

			if (!isValidTier(input)) {
				return null
			}

			return input
		},
		encode: (input) => input,
	},
)