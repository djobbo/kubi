import { cleanString } from "@dair/common/src/helpers/clean-string"
import { ParseResult, Schema } from "effect"

export const CleanString = Schema.transformOrFail(
	Schema.NonEmptyTrimmedString,
	Schema.String,
	{
		strict: true,
		decode: (input) => {
			const parsed = cleanString(input)
			return ParseResult.succeed(parsed)
		},
		encode: (input) => ParseResult.succeed(input),
	},
)
