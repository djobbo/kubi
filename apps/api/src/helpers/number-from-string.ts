import { ParseResult, Schema } from "effect"

export const NumberFromString = Schema.transformOrFail(
  Schema.Union(Schema.Number, Schema.String),
  Schema.Number,
  {
    strict: true,
    decode: (input, _, ast) => {
      if (typeof input === "number") {
        return ParseResult.succeed(input)
      }

      const parsed = Number.parseFloat(input)
      if (Number.isNaN(parsed)) {
        return ParseResult.fail(
          new ParseResult.Type(
            ast,
            input,
            "Failed to convert string to number",
          ),
        )
      }
      return ParseResult.succeed(parsed)
    },
    encode: (input) => ParseResult.succeed(input),
  },
)
